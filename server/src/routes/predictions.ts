import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';
import { predictTransformerRisk } from '../prediction/engine.js';

export async function predictionRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/predictions/run/:transformerId - run prediction for transformer
  server.post('/run/:transformerId', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { transformerId } = req.params as { transformerId: string };
    const db = getDb();

    const transformer = db.prepare('SELECT * FROM transformers WHERE id = ?').get(transformerId) as any;
    if (!transformer) {
      return reply.status(404).send({ error: 'Not Found', message: 'Transformer not found' });
    }

    // Fetch recent telemetry readings to calculate trend
    const recentReadings = db.prepare(`
      SELECT value FROM telemetry_readings
      WHERE transformer_id = ? AND sensor_type = 'active_power_kw'
      ORDER BY timestamp DESC
      LIMIT 5
    `).all(transformerId) as Array<{ value: number }>;

    const loadHistory = recentReadings.map(r => r.value).reverse();

    const result = predictTransformerRisk({
      transformerId,
      capacityKva: transformer.capacity_kva,
      currentLoadKw: transformer.current_load_kw,
      temperatureC: transformer.temperature_c,
      powerFactor: transformer.power_factor || 0.95,
      hour: new Date().getHours(),
      loadHistoryKw: loadHistory
    }, true);

    return reply.send({ prediction: result });
  });

  // GET /api/predictions/history - prediction history
  server.get('/history', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as {
      transformer_id?: string;
      risk_level?: string;
      limit?: string;
    };

    const db = getDb();
    let sql = `
      SELECT pr.*, t.name as transformer_name, t.capacity_kva, t.region_id
      FROM prediction_results pr
      JOIN transformers t ON pr.transformer_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query.transformer_id) {
      sql += ' AND pr.transformer_id = ?';
      params.push(query.transformer_id);
    }
    if (query.risk_level) {
      sql += ' AND pr.risk_level = ?';
      params.push(query.risk_level);
    }

    sql += ' ORDER BY pr.created_at DESC LIMIT ?';
    params.push(Math.min(200, parseInt(query.limit || '50', 10)));

    const predictions = db.prepare(sql).all(...params);
    return reply.send({ predictions });
  });

  // GET /api/predictions/model-info - model metadata
  server.get('/model-info', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      model_name: 'Urja-Sync Rule-Based Predictor (Demo)',
      model_type: 'Deterministic Trend & Thermal Extrapolator',
      version: '1.0.0',
      source: 'rule-based-demo',
      forecast_horizon_min: 15,
      features_used: [
        'active_power_kw',
        'transformer_temperature_c',
        'hour_of_day_diurnal_pattern',
        'telemetry_trend_derivative',
        'rated_transformer_capacity_kva'
      ],
      risk_thresholds: {
        NORMAL: '< 60% loading',
        WATCH: '60% - 75% loading',
        WARNING: '75% - 90% loading',
        CRITICAL: '>= 90% loading',
        DATA_UNAVAILABLE: 'Missing or corrupt telemetry'
      },
      status: 'operational',
      confidence_interval: 0.92
    });
  });
}
