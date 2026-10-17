import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { authenticate, authorize } from './auth.js';

const createTransformerSchema = z.object({
  name: z.string().min(2),
  feeder_id: z.string().min(1),
  region_id: z.string().min(1),
  capacity_kva: z.number().positive(),
  lat: z.number(),
  lng: z.number(),
  power_factor: z.number().min(0.5).max(1.0).default(0.95),
  voltage_class: z.string().default('11kV/415V')
});

const updateTransformerSchema = createTransformerSchema.partial().extend({
  status: z.enum(['normal', 'warning', 'critical', 'offline']).optional(),
  risk_level: z.enum(['NORMAL', 'WATCH', 'WARNING', 'CRITICAL', 'DATA_UNAVAILABLE']).optional()
});

export async function transformerRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/transformers - list with filters
  server.get('/', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as {
      region_id?: string;
      feeder_id?: string;
      status?: string;
      risk_level?: string;
      limit?: string;
      offset?: string;
    };

    const db = getDb();
    let sql = `
      SELECT t.*, r.name as region_name, f.name as feeder_name
      FROM transformers t
      JOIN regions r ON t.region_id = r.id
      JOIN feeders f ON t.feeder_id = f.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query.region_id) {
      sql += ' AND t.region_id = ?';
      params.push(query.region_id);
    }
    if (query.feeder_id) {
      sql += ' AND t.feeder_id = ?';
      params.push(query.feeder_id);
    }
    if (query.status) {
      sql += ' AND t.status = ?';
      params.push(query.status);
    }
    if (query.risk_level) {
      sql += ' AND t.risk_level = ?';
      params.push(query.risk_level);
    }

    sql += ' ORDER BY t.loading_pct DESC';

    const limit = Math.min(100, parseInt(query.limit || '100', 10));
    const offset = parseInt(query.offset || '0', 10);
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const transformers = db.prepare(sql).all(...params);
    return reply.send({ transformers });
  });

  // GET /api/transformers/:id - detail with latest readings
  server.get('/:id', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const transformer = db.prepare(`
      SELECT t.*, r.name as region_name, f.name as feeder_name
      FROM transformers t
      JOIN regions r ON t.region_id = r.id
      JOIN feeders f ON t.feeder_id = f.id
      WHERE t.id = ?
    `).get(id) as any;

    if (!transformer) {
      return reply.status(404).send({ error: 'Not Found', message: 'Transformer not found' });
    }

    const latestReadings = db.prepare(`
      SELECT tr.*
      FROM telemetry_readings tr
      WHERE tr.transformer_id = ?
      ORDER BY tr.timestamp DESC
      LIMIT 10
    `).all(id);

    const latestPrediction = db.prepare(`
      SELECT * FROM prediction_results
      WHERE transformer_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(id);

    return reply.send({
      transformer,
      latestReadings,
      latestPrediction
    });
  });

  // POST /api/transformers - create (admin)
  server.post('/', { preHandler: [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN'])] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = createTransformerSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const db = getDb();
    const data = parse.data;
    const newId = `tr-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO transformers (
        id, name, feeder_id, region_id, capacity_kva, lat, lng,
        status, current_load_kw, loading_pct, temperature_c,
        forecast_load_kw, risk_level, power_factor, voltage_class,
        connected_consumers, last_telemetry_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'normal', 0, 0, 32.0, 0, 'NORMAL', ?, ?, 0, ?, ?)
    `).run(
      newId,
      data.name,
      data.feeder_id,
      data.region_id,
      data.capacity_kva,
      data.lat,
      data.lng,
      data.power_factor,
      data.voltage_class,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM transformers WHERE id = ?').get(newId);
    return reply.status(201).send({ transformer: created });
  });

  // PUT /api/transformers/:id - update (admin)
  server.put('/:id', { preHandler: [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR'])] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parse = updateTransformerSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM transformers WHERE id = ?').get(id) as any;
    if (!existing) {
      return reply.status(404).send({ error: 'Not Found', message: 'Transformer not found' });
    }

    const updates = parse.data;
    const sets: string[] = [];
    const params: any[] = [];

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        sets.push(`${key} = ?`);
        params.push(val);
      }
    }

    if (sets.length > 0) {
      params.push(id);
      db.prepare(`UPDATE transformers SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM transformers WHERE id = ?').get(id);
    return reply.send({ transformer: updated });
  });

  // GET /api/transformers/:id/readings - historical readings
  server.get('/:id/readings', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const query = req.query as { limit?: string; sensor_type?: string };
    const db = getDb();

    let sql = 'SELECT * FROM telemetry_readings WHERE transformer_id = ?';
    const params: any[] = [id];

    if (query.sensor_type) {
      sql += ' AND sensor_type = ?';
      params.push(query.sensor_type);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(Math.min(500, parseInt(query.limit || '50', 10)));

    const readings = db.prepare(sql).all(...params);
    return reply.send({ readings });
  });

  // GET /api/transformers/:id/predictions - prediction history
  server.get('/:id/predictions', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const query = req.query as { limit?: string };
    const db = getDb();

    const limit = Math.min(100, parseInt(query.limit || '20', 10));
    const predictions = db.prepare(`
      SELECT * FROM prediction_results
      WHERE transformer_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(id, limit);

    return reply.send({ predictions });
  });
}
