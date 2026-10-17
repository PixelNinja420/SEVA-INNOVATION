import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { authenticate, authorize } from './auth.js';
import { broadcastCampaignUpdate } from '../websocket/handler.js';

const createCampaignSchema = z.object({
  transformer_id: z.string().min(1),
  region_id: z.string().min(1),
  target_reduction_kw: z.number().positive(),
  reason: z.string().min(3),
  selected_consumers: z.array(z.object({
    consumer_id: z.string(),
    appliance_id: z.string().optional().nullable(),
    flexible_load_kw: z.number().positive(),
    reward_offered: z.number().nonnegative()
  }))
});

const respondSchema = z.object({
  consumer_id: z.string().min(1),
  status: z.enum(['accepted', 'declined'])
});

export async function campaignRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/campaigns - list campaigns
  server.get('/', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as {
      transformer_id?: string;
      region_id?: string;
      status?: string;
      limit?: string;
    };

    const db = getDb();
    let sql = `
      SELECT drc.*, t.name as transformer_name, r.name as region_name,
        (SELECT COUNT(*) FROM campaign_consumers cc WHERE cc.campaign_id = drc.id) as total_invited_consumers,
        (SELECT COUNT(*) FROM campaign_consumers cc WHERE cc.campaign_id = drc.id AND cc.status = 'accepted') as accepted_consumers,
        u.name as creator_name
      FROM demand_response_campaigns drc
      JOIN transformers t ON drc.transformer_id = t.id
      JOIN regions r ON drc.region_id = r.id
      LEFT JOIN users u ON drc.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query.transformer_id) {
      sql += ' AND drc.transformer_id = ?';
      params.push(query.transformer_id);
    }
    if (query.region_id) {
      sql += ' AND drc.region_id = ?';
      params.push(query.region_id);
    }
    if (query.status) {
      sql += ' AND drc.status = ?';
      params.push(query.status);
    }

    sql += ' ORDER BY drc.created_at DESC LIMIT ?';
    params.push(Math.min(100, parseInt(query.limit || '50', 10)));

    const campaigns = db.prepare(sql).all(...params);
    return reply.send({ campaigns });
  });

  // POST /api/campaigns - create campaign (from optimization result)
  server.post('/', { preHandler: [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR'])] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = createCampaignSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const { transformer_id, region_id, target_reduction_kw, reason, selected_consumers } = parse.data;
    const user = req.user as any;
    const db = getDb();

    const campaignId = `camp-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();
    const estimatedCost = selected_consumers.reduce((acc, c) => acc + c.reward_offered, 0);

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO demand_response_campaigns (
          id, transformer_id, region_id, status, target_reduction_kw,
          achieved_reduction_kw, estimated_reward_cost, actual_reward_cost,
          reason, created_by, created_at
        ) VALUES (?, ?, ?, 'pending_approval', ?, 0, ?, 0, ?, ?, ?)
      `).run(campaignId, transformer_id, region_id, target_reduction_kw, estimatedCost, reason, user.id, now);

      const insertCc = db.prepare(`
        INSERT INTO campaign_consumers (
          id, campaign_id, consumer_id, appliance_id, flexible_load_kw,
          reward_offered, status, selected_by_optimizer, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1, ?)
      `);

      for (const item of selected_consumers) {
        insertCc.run(
          uuidv4(),
          campaignId,
          item.consumer_id,
          item.appliance_id || null,
          item.flexible_load_kw,
          item.reward_offered,
          now
        );
      }
    });

    tx();

    const created = db.prepare('SELECT * FROM demand_response_campaigns WHERE id = ?').get(campaignId);
    broadcastCampaignUpdate(created);

    return reply.status(201).send({ campaign: created });
  });

  // GET /api/campaigns/:id - campaign detail with consumers
  server.get('/:id', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const campaign = db.prepare(`
      SELECT drc.*, t.name as transformer_name, r.name as region_name,
             u.name as creator_name, ap.name as approver_name
      FROM demand_response_campaigns drc
      JOIN transformers t ON drc.transformer_id = t.id
      JOIN regions r ON drc.region_id = r.id
      LEFT JOIN users u ON drc.created_by = u.id
      LEFT JOIN users ap ON drc.approved_by = ap.id
      WHERE drc.id = ?
    `).get(id) as any;

    if (!campaign) {
      return reply.status(404).send({ error: 'Not Found', message: 'Campaign not found' });
    }

    const participants = db.prepare(`
      SELECT cc.*, c.name as consumer_name, c.service_connection_no,
             a.name as appliance_name, a.type as appliance_type
      FROM campaign_consumers cc
      JOIN consumers c ON cc.consumer_id = c.id
      LEFT JOIN appliances a ON cc.appliance_id = a.id
      WHERE cc.campaign_id = ?
    `).all(id);

    return reply.send({
      campaign,
      participants
    });
  });

  // PUT /api/campaigns/:id/approve - approve campaign (operator/admin)
  server.put('/:id/approve', { preHandler: [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR'])] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const user = req.user as any;
    const db = getDb();

    const campaign = db.prepare('SELECT * FROM demand_response_campaigns WHERE id = ?').get(id) as any;
    if (!campaign) {
      return reply.status(404).send({ error: 'Not Found', message: 'Campaign not found' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE demand_response_campaigns SET
        status = 'active',
        approved_by = ?,
        approved_at = ?,
        started_at = ?
      WHERE id = ?
    `).run(user.id, now, now, id);

    const updated = db.prepare('SELECT * FROM demand_response_campaigns WHERE id = ?').get(id);
    broadcastCampaignUpdate(updated);

    return reply.send({ campaign: updated, message: 'Campaign approved and activated successfully' });
  });

  // PUT /api/campaigns/:id/cancel - cancel campaign
  server.put('/:id/cancel', { preHandler: [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR'])] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const campaign = db.prepare('SELECT * FROM demand_response_campaigns WHERE id = ?').get(id) as any;
    if (!campaign) {
      return reply.status(404).send({ error: 'Not Found', message: 'Campaign not found' });
    }

    db.prepare(`
      UPDATE demand_response_campaigns SET
        status = 'cancelled',
        completed_at = datetime('now')
      WHERE id = ?
    `).run(id);

    const updated = db.prepare('SELECT * FROM demand_response_campaigns WHERE id = ?').get(id);
    broadcastCampaignUpdate(updated);

    return reply.send({ campaign: updated, message: 'Campaign cancelled' });
  });

  // POST /api/campaigns/:id/respond - consumer response (accept/decline)
  server.post('/:id/respond', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parse = respondSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const { consumer_id, status } = parse.data;
    const db = getDb();

    const invitation = db.prepare(`
      SELECT * FROM campaign_consumers WHERE campaign_id = ? AND consumer_id = ?
    `).get(id, consumer_id) as any;

    if (!invitation) {
      return reply.status(404).send({ error: 'Not Found', message: 'Campaign invitation not found for this consumer' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE campaign_consumers SET
        status = ?,
        responded_at = ?
      WHERE id = ?
    `).run(status, now, invitation.id);

    // If accepted, also increment participation streak
    if (status === 'accepted') {
      db.prepare(`
        UPDATE consumers SET
          participation_streak = participation_streak + 1
        WHERE id = ?
      `).run(consumer_id);
    }

    const updatedInvitation = db.prepare('SELECT * FROM campaign_consumers WHERE id = ?').get(invitation.id);
    return reply.send({ invitation: updatedInvitation });
  });

  // GET /api/campaigns/:id/results - campaign results
  server.get('/:id/results', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const campaign = db.prepare('SELECT * FROM demand_response_campaigns WHERE id = ?').get(id) as any;
    if (!campaign) {
      return reply.status(404).send({ error: 'Not Found', message: 'Campaign not found' });
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_invited,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COALESCE(SUM(CASE WHEN status IN ('accepted', 'completed') THEN flexible_load_kw ELSE 0 END), 0) as committed_reduction_kw,
        COALESCE(SUM(CASE WHEN status IN ('accepted', 'completed') THEN reward_offered ELSE 0 END), 0) as committed_reward_cost
      FROM campaign_consumers
      WHERE campaign_id = ?
    `).get(id) as any;

    return reply.send({
      campaignId: id,
      targetReductionKw: campaign.target_reduction_kw,
      achievedReductionKw: campaign.achieved_reduction_kw || stats.committed_reduction_kw,
      status: campaign.status,
      metrics: stats,
      complianceRatePct: stats.total_invited > 0 ? parseFloat(((stats.accepted_count / stats.total_invited) * 100).toFixed(1)) : 0
    });
  });
}
