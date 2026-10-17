import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { PredictionInput, PredictionOutput } from '../types/index.js';

/**
 * Rule-Based Predictor for Transformer Overload Risk
 * Source: rule-based-demo
 */
export function predictTransformerRisk(input: PredictionInput, saveToDb: boolean = true): PredictionOutput {
  const {
    transformerId,
    capacityKva,
    currentLoadKw,
    temperatureC,
    powerFactor = 0.95,
    hour = new Date().getHours(),
    loadHistoryKw = [],
    recentTrendRate
  } = input;

  const ratedPowerKw = capacityKva * powerFactor;

  if (ratedPowerKw <= 0 || currentLoadKw === undefined || currentLoadKw === null || Number.isNaN(currentLoadKw)) {
    const fallback: PredictionOutput = {
      transformerId,
      predictedLoadKw: 0,
      predictedLoadingPct: 0,
      riskLevel: 'DATA_UNAVAILABLE',
      riskScore: 0,
      confidence: 0,
      predictionSource: 'rule-based-demo',
      forecastHorizonMin: 15,
      explanation: 'Insufficient telemetry data or unrated transformer capacity.'
    };
    if (saveToDb) {
      persistPrediction(fallback);
    }
    return fallback;
  }

  // 1. Calculate base trend from history or recent trend rate
  let trendRatePer15Min = 0;
  if (recentTrendRate !== undefined) {
    trendRatePer15Min = recentTrendRate * 15;
  } else if (loadHistoryKw.length >= 2) {
    const last = loadHistoryKw[loadHistoryKw.length - 1];
    const prev = loadHistoryKw[loadHistoryKw.length - 2];
    trendRatePer15Min = (last - prev) * 1.5; // extrapolated to 15 min
  }

  // 2. Diurnal pattern effect based on hour of day
  // Peak residential hours: 18:00 - 22:00
  let diurnalGrowthFactor = 0;
  if (hour >= 18 && hour <= 21) {
    diurnalGrowthFactor = 0.05; // +5% ramp in evening
  } else if (hour >= 12 && hour <= 15) {
    diurnalGrowthFactor = 0.02; // afternoon AC cooling load
  } else if (hour >= 23 || hour <= 5) {
    diurnalGrowthFactor = -0.03; // nighttime decline
  }

  // 3. Thermal stress impact
  let thermalStrainFactor = 0;
  if (temperatureC > 45) {
    thermalStrainFactor = 0.04;
  } else if (temperatureC > 38) {
    thermalStrainFactor = 0.02;
  }

  // 4. Calculate predicted load
  const extrapolatedLoad = currentLoadKw * (1 + diurnalGrowthFactor + thermalStrainFactor) + trendRatePer15Min;
  const predictedLoadKw = Math.max(0, parseFloat(extrapolatedLoad.toFixed(2)));
  const predictedLoadingPct = parseFloat(((predictedLoadKw / ratedPowerKw) * 100).toFixed(1));

  // 5. Risk classification
  let riskLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'DATA_UNAVAILABLE';
  let riskScore: number;

  if (predictedLoadingPct < 60) {
    riskLevel = 'NORMAL';
    riskScore = parseFloat((predictedLoadingPct / 120).toFixed(2));
  } else if (predictedLoadingPct < 75) {
    riskLevel = 'WATCH';
    riskScore = parseFloat((0.50 + ((predictedLoadingPct - 60) / 15) * 0.20).toFixed(2));
  } else if (predictedLoadingPct < 90) {
    riskLevel = 'WARNING';
    riskScore = parseFloat((0.70 + ((predictedLoadingPct - 75) / 15) * 0.18).toFixed(2));
  } else {
    riskLevel = 'CRITICAL';
    riskScore = parseFloat(Math.min(0.99, 0.88 + ((predictedLoadingPct - 90) / 25) * 0.11).toFixed(2));
  }

  // 6. Natural language explanation
  const factors: string[] = [];
  if (diurnalGrowthFactor > 0) {
    factors.push(`diurnal peak window (+${(diurnalGrowthFactor * 100).toFixed(0)}%)`);
  } else if (diurnalGrowthFactor < 0) {
    factors.push(`off-peak nighttime cooldown (${(diurnalGrowthFactor * 100).toFixed(0)}%)`);
  }

  if (temperatureC > 38) {
    factors.push(`elevated top-oil temperature (${temperatureC.toFixed(1)}°C)`);
  }

  if (trendRatePer15Min > 0.5) {
    factors.push(`rising telemetry trend (+${trendRatePer15Min.toFixed(1)} kW)`);
  }

  const factorText = factors.length > 0 ? factors.join(', ') : 'steady-state loading';
  const explanation = `[DEMO PREDICTION] Projected 15-min loading of ${predictedLoadingPct}% (${predictedLoadKw} kW / ${ratedPowerKw.toFixed(0)} kW rated) influenced by ${factorText}. Risk categorized as ${riskLevel}.`;

  const output: PredictionOutput = {
    transformerId,
    predictedLoadKw,
    predictedLoadingPct,
    riskLevel,
    riskScore,
    confidence: 0.92,
    predictionSource: 'rule-based-demo',
    forecastHorizonMin: 15,
    explanation
  };

  if (saveToDb) {
    persistPrediction(output);
  }

  return output;
}

function persistPrediction(pred: PredictionOutput): void {
  try {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO prediction_results (
        id, transformer_id, predicted_load_kw, predicted_loading_pct,
        risk_level, risk_score, confidence, prediction_source,
        forecast_horizon_min, explanation, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      pred.transformerId,
      pred.predictedLoadKw,
      pred.predictedLoadingPct,
      pred.riskLevel,
      pred.riskScore,
      pred.confidence,
      pred.predictionSource,
      pred.forecastHorizonMin,
      pred.explanation,
      now
    );

    // Also update transformer forecast_load_kw and risk_level
    db.prepare(
      `UPDATE transformers SET
        forecast_load_kw = ?,
        risk_level = ?
       WHERE id = ?`
    ).run(pred.predictedLoadKw, pred.riskLevel, pred.transformerId);
  } catch (err) {
    console.error('Failed to persist prediction result:', err);
  }
}
