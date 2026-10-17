import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';

export async function regionRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/regions
  server.get('/', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    const db = getDb();
    const query = req.query as { discom_id?: string };

    let sql = `
      SELECT r.*, d.name as discom_name,
        (SELECT COUNT(*) FROM feeders f WHERE f.region_id = r.id) as feeder_count,
        (SELECT COUNT(*) FROM transformers t WHERE t.region_id = r.id) as transformer_count,
        (SELECT COUNT(*) FROM transformers t WHERE t.region_id = r.id AND t.status = 'critical') as critical_transformers,
        (SELECT COUNT(*) FROM transformers t WHERE t.region_id = r.id AND t.status = 'warning') as warning_transformers,
        (SELECT COALESCE(SUM(current_load_kw), 0) FROM transformers t WHERE t.region_id = r.id) as current_load_kw,
        (SELECT COALESCE(SUM(capacity_kva), 0) FROM transformers t WHERE t.region_id = r.id) as total_capacity_kva
      FROM regions r
      JOIN discoms d ON r.discom_id = d.id
    `;
    const params: any[] = [];

    if (user.role === 'DISCOM_ADMIN' && user.discom_id) {
      sql += ' WHERE r.discom_id = ?';
      params.push(user.discom_id);
    } else if (user.role === 'GRID_OPERATOR' && user.region_id) {
      sql += ' WHERE r.id = ? OR r.parent_region_id = ?';
      params.push(user.region_id, user.region_id);
    } else if (query.discom_id) {
      sql += ' WHERE r.discom_id = ?';
      params.push(query.discom_id);
    }

    sql += ' ORDER BY r.name ASC';

    const regions = db.prepare(sql).all(...params);
    return reply.send({ regions });
  });

  // GET /api/regions/:id
  server.get('/:id', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const region = db.prepare(`
      SELECT r.*, d.name as discom_name,
        (SELECT COUNT(*) FROM feeders f WHERE f.region_id = r.id) as feeder_count,
        (SELECT COUNT(*) FROM transformers t WHERE t.region_id = r.id) as transformer_count,
        (SELECT COUNT(*) FROM transformers t WHERE t.region_id = r.id AND t.status = 'critical') as critical_count,
        (SELECT COUNT(*) FROM transformers t WHERE t.region_id = r.id AND t.status = 'warning') as warning_count,
        (SELECT COALESCE(SUM(current_load_kw), 0) FROM transformers t WHERE t.region_id = r.id) as current_load_kw,
        (SELECT COALESCE(SUM(capacity_kva), 0) FROM transformers t WHERE t.region_id = r.id) as total_capacity_kva,
        (SELECT COALESCE(AVG(loading_pct), 0) FROM transformers t WHERE t.region_id = r.id) as avg_loading_pct
      FROM regions r
      JOIN discoms d ON r.discom_id = d.id
      WHERE r.id = ?
    `).get(id) as any;

    if (!region) {
      return reply.status(404).send({ error: 'Not Found', message: 'Region not found' });
    }

    const feeders = db.prepare('SELECT * FROM feeders WHERE region_id = ? ORDER BY name ASC').all(id);
    const batteries = db.prepare('SELECT * FROM batteries WHERE region_id = ?').all(id);

    return reply.send({
      region,
      feeders,
      batteries
    });
  });

  // GET /api/regions/:id/stats
  server.get('/:id/stats', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const region = db.prepare('SELECT * FROM regions WHERE id = ?').get(id);
    if (!region) {
      return reply.status(404).send({ error: 'Not Found', message: 'Region not found' });
    }

    const transformerStats = db.prepare(`
      SELECT 
        COUNT(*) as total_transformers,
        COALESCE(SUM(capacity_kva), 0) as total_capacity_kva,
        COALESCE(SUM(current_load_kw), 0) as current_load_kw,
        COALESCE(AVG(loading_pct), 0) as avg_loading_pct,
        COALESCE(AVG(temperature_c), 0) as avg_temperature_c,
        COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN status = 'normal' THEN 1 END) as normal_count,
        COALESCE(SUM(connected_consumers), 0) as total_consumers
      FROM transformers
      WHERE region_id = ?
    `).get(id) as any;

    const consumerStats = db.prepare(`
      SELECT 
        COUNT(*) as total_flexible_consumers,
        COALESCE(SUM(sanctioned_load_kw), 0) as total_sanctioned_load_kw,
        COALESCE(SUM(urja_coins), 0) as total_coins_distributed
      FROM consumers
      WHERE region_id = ? AND is_flexible = 1
    `).get(id) as any;

    return reply.send({
      regionId: id,
      transformerStats,
      consumerStats
    });
  });
}
