import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';

const preferencesSchema = z.object({
  is_flexible: z.boolean().optional(),
  appliances: z.array(z.object({
    id: z.string(),
    is_flexible: z.boolean().optional(),
    is_available: z.boolean().optional(),
    max_interruption_minutes: z.number().optional(),
    priority: z.number().optional()
  })).optional()
});

export async function consumerRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/consumers - list (filtered by region/transformer)
  server.get('/', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as {
      region_id?: string;
      transformer_id?: string;
      is_flexible?: string;
      limit?: string;
      offset?: string;
    };

    const db = getDb();
    let sql = `
      SELECT c.*, t.name as transformer_name, r.name as region_name,
        (SELECT COUNT(*) FROM appliances a WHERE a.consumer_id = c.id) as appliance_count,
        (SELECT COALESCE(SUM(a.rated_power_kw), 0) FROM appliances a WHERE a.consumer_id = c.id AND a.is_flexible = 1) as total_flexible_kw
      FROM consumers c
      JOIN transformers t ON c.transformer_id = t.id
      JOIN regions r ON c.region_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query.region_id) {
      sql += ' AND c.region_id = ?';
      params.push(query.region_id);
    }
    if (query.transformer_id) {
      sql += ' AND c.transformer_id = ?';
      params.push(query.transformer_id);
    }
    if (query.is_flexible !== undefined) {
      sql += ' AND c.is_flexible = ?';
      params.push(query.is_flexible === 'true' || query.is_flexible === '1' ? 1 : 0);
    }

    sql += ' ORDER BY c.name ASC';

    const limit = Math.min(200, parseInt(query.limit || '100', 10));
    const offset = parseInt(query.offset || '0', 10);
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const consumers = db.prepare(sql).all(...params);
    return reply.send({ consumers });
  });

  // GET /api/consumers/me - current consumer's dashboard data
  server.get('/me', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    const db = getDb();

    let consumer = db.prepare(`
      SELECT c.*, t.name as transformer_name, t.loading_pct as transformer_loading_pct,
             t.status as transformer_status, r.name as region_name
      FROM consumers c
      JOIN transformers t ON c.transformer_id = t.id
      JOIN regions r ON c.region_id = r.id
      WHERE c.user_id = ?
    `).get(user.id) as any;

    // Fallback if not directly matched by user_id
    if (!consumer && user.role === 'CONSUMER') {
      consumer = db.prepare(`
        SELECT c.*, t.name as transformer_name, t.loading_pct as transformer_loading_pct,
               t.status as transformer_status, r.name as region_name
        FROM consumers c
        JOIN transformers t ON c.transformer_id = t.id
        JOIN regions r ON c.region_id = r.id
        ORDER BY c.created_at ASC LIMIT 1
      `).get() as any;
    }

    if (!consumer) {
      return reply.status(404).send({ error: 'Not Found', message: 'No consumer profile linked to this user' });
    }

    const appliances = db.prepare('SELECT * FROM appliances WHERE consumer_id = ?').all(consumer.id);
    const activeCampaigns = db.prepare(`
      SELECT cc.*, drc.reason, drc.status as campaign_status, drc.target_reduction_kw
      FROM campaign_consumers cc
      JOIN demand_response_campaigns drc ON cc.campaign_id = drc.id
      WHERE cc.consumer_id = ? AND drc.status IN ('approved', 'active')
    `).all(consumer.id);

    const recentTransactions = db.prepare(`
      SELECT * FROM reward_transactions
      WHERE consumer_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(consumer.id);

    return reply.send({
      consumer,
      appliances,
      activeCampaigns,
      recentTransactions
    });
  });

  // GET /api/consumers/:id - consumer detail
  server.get('/:id', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const consumer = db.prepare(`
      SELECT c.*, t.name as transformer_name, t.capacity_kva as transformer_capacity,
             t.loading_pct as transformer_loading, r.name as region_name
      FROM consumers c
      JOIN transformers t ON c.transformer_id = t.id
      JOIN regions r ON c.region_id = r.id
      WHERE c.id = ?
    `).get(id) as any;

    if (!consumer) {
      return reply.status(404).send({ error: 'Not Found', message: 'Consumer not found' });
    }

    const appliances = db.prepare('SELECT * FROM appliances WHERE consumer_id = ?').all(id);

    return reply.send({
      consumer,
      appliances
    });
  });

  // GET /api/consumers/:id/appliances - consumer's appliances
  server.get('/:id/appliances', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const appliances = db.prepare('SELECT * FROM appliances WHERE consumer_id = ?').all(id);
    return reply.send({ appliances });
  });

  // PUT /api/consumers/:id/preferences - update preferences
  server.put('/:id/preferences', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parse = preferencesSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM consumers WHERE id = ?').get(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Not Found', message: 'Consumer not found' });
    }

    const { is_flexible, appliances } = parse.data;

    const tx = db.transaction(() => {
      if (is_flexible !== undefined) {
        db.prepare('UPDATE consumers SET is_flexible = ? WHERE id = ?').run(is_flexible ? 1 : 0, id);
      }

      if (appliances && appliances.length > 0) {
        for (const app of appliances) {
          const sets: string[] = [];
          const params: any[] = [];

          if (app.is_flexible !== undefined) {
            sets.push('is_flexible = ?');
            params.push(app.is_flexible ? 1 : 0);
          }
          if (app.is_available !== undefined) {
            sets.push('is_available = ?');
            params.push(app.is_available ? 1 : 0);
          }
          if (app.max_interruption_minutes !== undefined) {
            sets.push('max_interruption_minutes = ?');
            params.push(app.max_interruption_minutes);
          }
          if (app.priority !== undefined) {
            sets.push('priority = ?');
            params.push(app.priority);
          }

          if (sets.length > 0) {
            params.push(app.id, id);
            db.prepare(`UPDATE appliances SET ${sets.join(', ')} WHERE id = ? AND consumer_id = ?`).run(...params);
          }
        }
      }
    });

    tx();

    const updatedConsumer = db.prepare('SELECT * FROM consumers WHERE id = ?').get(id);
    const updatedAppliances = db.prepare('SELECT * FROM appliances WHERE consumer_id = ?').all(id);

    return reply.send({
      consumer: updatedConsumer,
      appliances: updatedAppliances
    });
  });
}
