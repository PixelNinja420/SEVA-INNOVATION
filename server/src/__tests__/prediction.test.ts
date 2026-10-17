import { describe, it, expect } from 'vitest';
import { predictTransformerRisk } from '../prediction/engine.js';

describe('Prediction Engine (Rule-Based Demo)', () => {
  it('should return DATA_UNAVAILABLE when input is missing or capacity is 0', () => {
    const result = predictTransformerRisk({
      transformerId: 'test-trans-1',
      capacityKva: 0,
      currentLoadKw: 0,
      temperatureC: 30,
      powerFactor: 0.95,
      hour: 12
    }, false);

    expect(result.riskLevel).toBe('DATA_UNAVAILABLE');
    expect(result.predictedLoadKw).toBe(0);
  });

  it('should classify low load as NORMAL', () => {
    // 100 kVA * 0.95 = 95 kW rated
    // 30 kW is ~31.5% load
    const result = predictTransformerRisk({
      transformerId: 'test-trans-2',
      capacityKva: 100,
      currentLoadKw: 30,
      temperatureC: 32,
      powerFactor: 0.95,
      hour: 10
    }, false);

    expect(result.riskLevel).toBe('NORMAL');
    expect(result.predictedLoadingPct).toBeLessThan(60);
    expect(result.predictionSource).toBe('rule-based-demo');
  });

  it('should classify moderate load as WATCH', () => {
    // 100 kVA * 0.95 = 95 kW rated
    // 60 kW is ~63% load
    const result = predictTransformerRisk({
      transformerId: 'test-trans-3',
      capacityKva: 100,
      currentLoadKw: 60,
      temperatureC: 34,
      powerFactor: 0.95,
      hour: 10
    }, false);

    expect(result.riskLevel).toBe('WATCH');
    expect(result.predictedLoadingPct).toBeGreaterThanOrEqual(60);
    expect(result.predictedLoadingPct).toBeLessThan(75);
  });

  it('should classify high evening load as WARNING', () => {
    // 100 kVA * 0.95 = 95 kW rated
    // 72 kW load at 19:00 (evening ramp +5% -> ~75.6 kW -> ~79.5%)
    const result = predictTransformerRisk({
      transformerId: 'test-trans-4',
      capacityKva: 100,
      currentLoadKw: 72,
      temperatureC: 37,
      powerFactor: 0.95,
      hour: 19
    }, false);

    expect(result.riskLevel).toBe('WARNING');
    expect(result.predictedLoadingPct).toBeGreaterThanOrEqual(75);
    expect(result.predictedLoadingPct).toBeLessThan(90);
    expect(result.explanation).toContain('diurnal peak window');
  });

  it('should classify critical load and high temperature as CRITICAL', () => {
    // 100 kVA * 0.95 = 95 kW rated
    // 85 kW at 46°C temperature during evening peak
    const result = predictTransformerRisk({
      transformerId: 'test-trans-5',
      capacityKva: 100,
      currentLoadKw: 85,
      temperatureC: 47,
      powerFactor: 0.95,
      hour: 20
    }, false);

    expect(result.riskLevel).toBe('CRITICAL');
    expect(result.predictedLoadingPct).toBeGreaterThanOrEqual(90);
    expect(result.riskScore).toBeGreaterThanOrEqual(0.88);
    expect(result.explanation).toContain('CRITICAL');
  });
});
