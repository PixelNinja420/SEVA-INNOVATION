import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../database/connection.js';

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async (_req: FastifyRequest, reply: FastifyReply) => {
    let dbStatus = 'ok';
    try {
      const db = getDb();
      db.prepare('SELECT 1').get();
    } catch {
      dbStatus = 'error';
    }

    return reply.send({
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'Urja-Sync Backend API',
      version: '1.0.0',
      database: dbStatus
    });
  });
}
