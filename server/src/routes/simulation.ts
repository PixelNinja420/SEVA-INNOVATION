import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';
import { SimulationEngine } from '../simulation/engine.js';

const speedSchema = z.object({
  speed: z.number().min(0.1).max(20.0)
});

const scenarioSchema = z.object({
  scenario_id: z.string().min(1)
});

const injectSchema = z.object({
  type: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical']).default('warning'),
  message: z.string().optional(),
  transformerId: z.string().optional()
});

const resetSchema = z.object({
  seed: z.number().int().optional().default(42)
});

export async function simulationRoutes(server: FastifyInstance): Promise<void> {
  const engine = SimulationEngine.getInstance();

  // GET /api/simulation/state - current simulation state
  server.get('/state', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      state: engine.getState(),
      events: engine.getRecentEvents()
    });
  });

  // POST /api/simulation/start - start simulation
  server.post('/start', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    engine.start();
    return reply.send({ message: 'Simulation started', state: engine.getState() });
  });

  // POST /api/simulation/pause - pause
  server.post('/pause', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    engine.pause();
    return reply.send({ message: 'Simulation paused', state: engine.getState() });
  });

  // POST /api/simulation/resume - resume
  server.post('/resume', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    engine.resume();
    return reply.send({ message: 'Simulation resumed', state: engine.getState() });
  });

  // POST /api/simulation/stop - stop
  server.post('/stop', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    engine.stop();
    return reply.send({ message: 'Simulation stopped', state: engine.getState() });
  });

  // POST /api/simulation/reset - reset
  server.post('/reset', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = resetSchema.safeParse(req.body || {});
    const seed = parse.success ? parse.data.seed : 42;
    engine.reset(seed);
    return reply.send({ message: 'Simulation reset', state: engine.getState() });
  });

  // POST /api/simulation/step - step forward
  server.post('/step', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    engine.step();
    return reply.send({ message: 'Simulation stepped forward', state: engine.getState() });
  });

  // PUT /api/simulation/speed - change speed
  server.put('/speed', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = speedSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    engine.setSpeed(parse.data.speed);
    return reply.send({ message: 'Speed updated', speed: parse.data.speed });
  });

  // PUT /api/simulation/scenario - change scenario
  server.put('/scenario', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = scenarioSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    engine.setScenario(parse.data.scenario_id);
    return reply.send({ message: 'Scenario updated', state: engine.getState() });
  });

  // POST /api/simulation/inject - inject event
  server.post('/inject', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = injectSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const event = engine.injectEvent(parse.data.type, parse.data);
    return reply.send({ message: 'Event injected', event });
  });

  // GET /api/simulation/scenarios - list scenarios
  server.get('/scenarios', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const scenarios = db.prepare('SELECT * FROM simulation_scenarios ORDER BY created_at ASC').all();
    return reply.send({
      scenarios: scenarios.map((s: any) => ({
        ...s,
        config: JSON.parse(s.config)
      }))
    });
  });
}
