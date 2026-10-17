import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';
import { solveKnapsack } from '../optimization/knapsack.js';
import { KnapsackItem } from '../types/index.js';

const runOptimizationSchema = z.object({
  transformer_id: z.string().min(1),
  target_reduction_kw: z.number().positive(),
  points_per_kwh: z.number().positive().default(15.0)
});

const testOptimizationSchema = z.object({
  target_reduction_kw: z.number().nonnegative(),
  items: z.array(z.object({
    id: z.string(),
    consumerId: z.string(),
    applianceId: z.string().optional(),
    flexibleLoadKw: z.number().positive(),
    rewardCost: z.number().nonnegative(),
    priority: z.number().optional(),
    consumerName: z.string().optional(),
    applianceName: z.string().optional()
  }))
});

export async function optimizationRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/optimization/run - run knapsack optimization for a transformer
  server.post('/run', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = runOptimizationSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const { transformer_id, target_reduction_kw, points_per_kwh } = parse.data;
    const db = getDb();

    const transformer = db.prepare('SELECT * FROM transformers WHERE id = ?').get(transformer_id) as any;
    if (!transformer) {
      return reply.status(404).send({ error: 'Not Found', message: 'Transformer not found' });
    }

    // Query flexible consumers and their available flexible appliances
    const candidateRows = db.prepare(`
      SELECT 
        c.id as consumer_id,
        c.name as consumer_name,
        a.id as appliance_id,
        a.name as appliance_name,
        a.rated_power_kw as flexible_load_kw,
        a.priority
      FROM consumers c
      JOIN appliances a ON a.consumer_id = c.id
      WHERE c.transformer_id = ? 
        AND c.is_flexible = 1 
        AND a.is_flexible = 1 
        AND a.is_available = 1
      ORDER BY a.priority ASC, a.rated_power_kw DESC
    `).all(transformer_id) as any[];

    const knapsackItems: KnapsackItem[] = candidateRows.map(row => ({
      id: `${row.consumer_id}-${row.appliance_id}`,
      consumerId: row.consumer_id,
      consumerName: row.consumer_name,
      applianceId: row.appliance_id,
      applianceName: row.appliance_name,
      flexibleLoadKw: row.flexible_load_kw,
      rewardCost: parseFloat((row.flexible_load_kw * points_per_kwh).toFixed(2)),
      priority: row.priority
    }));

    const result = solveKnapsack(target_reduction_kw, knapsackItems);

    return reply.send({
      transformer: {
        id: transformer.id,
        name: transformer.name,
        current_load_kw: transformer.current_load_kw,
        capacity_kva: transformer.capacity_kva,
        loading_pct: transformer.loading_pct
      },
      targetReductionKw: target_reduction_kw,
      candidatesAvailable: knapsackItems.length,
      optimization: result
    });
  });

  // POST /api/optimization/test - manual test interface
  server.post('/test', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = testOptimizationSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const { target_reduction_kw, items } = parse.data;
    const result = solveKnapsack(target_reduction_kw, items);
    return reply.send({ result });
  });

  // GET /api/optimization/history - optimization history
  server.get('/history', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const history = db.prepare(`
      SELECT drc.id, drc.transformer_id, drc.target_reduction_kw, drc.achieved_reduction_kw,
             drc.estimated_reward_cost, drc.status, drc.created_at,
             t.name as transformer_name,
             (SELECT COUNT(*) FROM campaign_consumers cc WHERE cc.campaign_id = drc.id) as consumers_selected
      FROM demand_response_campaigns drc
      JOIN transformers t ON drc.transformer_id = t.id
      ORDER BY drc.created_at DESC
      LIMIT 20
    `).all();

    return reply.send({ history });
  });
}
