import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';

export async function rewardRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/rewards/balance/:consumerId - consumer balance
  server.get('/balance/:consumerId', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { consumerId } = req.params as { consumerId: string };
    const db = getDb();

    const consumer = db.prepare('SELECT id, name, urja_coins, participation_streak FROM consumers WHERE id = ?').get(consumerId) as any;
    if (!consumer) {
      return reply.status(404).send({ error: 'Not Found', message: 'Consumer not found' });
    }

    const lifetimeStats = db.prepare(`
      SELECT 
        COALESCE(SUM(points), 0) as lifetime_earned,
        COUNT(*) as total_rewards_count
      FROM reward_transactions
      WHERE consumer_id = ? AND status = 'confirmed'
    `).get(consumerId) as any;

    return reply.send({
      consumerId: consumer.id,
      consumerName: consumer.name,
      currentBalance: consumer.urja_coins,
      participationStreak: consumer.participation_streak,
      lifetimeEarned: lifetimeStats.lifetime_earned,
      totalRewardsCount: lifetimeStats.total_rewards_count
    });
  });

  // GET /api/rewards/transactions - transaction history
  server.get('/transactions', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as {
      consumer_id?: string;
      campaign_id?: string;
      limit?: string;
    };

    const db = getDb();
    let sql = `
      SELECT rt.*, c.name as consumer_name, drc.reason as campaign_reason,
             t.name as transformer_name, r.name as region_name
      FROM reward_transactions rt
      JOIN consumers c ON rt.consumer_id = c.id
      LEFT JOIN demand_response_campaigns drc ON rt.campaign_id = drc.id
      LEFT JOIN transformers t ON rt.transformer_id = t.id
      LEFT JOIN regions r ON rt.region_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query.consumer_id) {
      sql += ' AND rt.consumer_id = ?';
      params.push(query.consumer_id);
    }
    if (query.campaign_id) {
      sql += ' AND rt.campaign_id = ?';
      params.push(query.campaign_id);
    }

    sql += ' ORDER BY rt.created_at DESC LIMIT ?';
    params.push(Math.min(200, parseInt(query.limit || '50', 10)));

    const transactions = db.prepare(sql).all(...params);
    return reply.send({ transactions });
  });

  // GET /api/rewards/stats - reward statistics
  server.get('/stats', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();

    const overview = db.prepare(`
      SELECT 
        COALESCE(SUM(points), 0) as total_points_distributed,
        COUNT(*) as total_transactions,
        COALESCE(AVG(points), 0) as avg_points_per_transaction
      FROM reward_transactions
      WHERE status = 'confirmed'
    `).get() as any;

    const topConsumers = db.prepare(`
      SELECT c.id, c.name, c.urja_coins, c.participation_streak,
             r.name as region_name, t.name as transformer_name
      FROM consumers c
      JOIN regions r ON c.region_id = r.id
      JOIN transformers t ON c.transformer_id = t.id
      ORDER BY c.urja_coins DESC
      LIMIT 5
    `).all();

    return reply.send({
      overview: {
        totalPointsDistributed: overview.total_points_distributed,
        totalTransactions: overview.total_transactions,
        avgPointsPerTransaction: parseFloat(overview.avg_points_per_transaction.toFixed(1))
      },
      topConsumers
    });
  });

  // GET /api/rewards/policies - reward policies
  server.get('/policies', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const policies = db.prepare('SELECT * FROM reward_policies ORDER BY created_at ASC').all();
    return reply.send({ policies });
  });
}
