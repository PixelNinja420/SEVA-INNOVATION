import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../index.js';
import { seedDatabase } from '../database/seed.js';
import { getDb, closeDb } from '../database/connection.js';

describe('Rewards and Ledger Integrity', () => {
  let server: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedDatabase(process.env.DATABASE_PATH);
    server = await buildServer();
    await server.ready();

    const loginRes = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'super@urjasync.demo',
        password: 'SuperAdmin@123'
      }
    });
    adminToken = JSON.parse(loginRes.body).token;
  });

  afterAll(async () => {
    await server.close();
    closeDb();
  });

  it('should fetch consumer balance accurately', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/rewards/balance/cons-001',
      headers: { authorization: `Bearer ${adminToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.consumerId).toBe('cons-001');
    expect(body.currentBalance).toBeGreaterThan(0);
    expect(body.totalRewardsCount).toBeGreaterThanOrEqual(1);
  });

  it('should credit points and prevent duplicate transaction entries', async () => {
    const db = getDb();
    const consumerId = 'cons-001';
    const txId = 'tx-test-unique-001';

    // Get current balance
    const beforeConsumer = db.prepare('SELECT urja_coins FROM consumers WHERE id = ?').get(consumerId) as any;
    const initialCoins = beforeConsumer.urja_coins;

    // Credit points via transaction
    const pointsToCredit = 50;
    const now = new Date().toISOString();

    const insertTx = db.prepare(`
      INSERT INTO reward_transactions (id, consumer_id, points, status, reason, created_at)
      VALUES (?, ?, ?, 'confirmed', 'Test load curtailment', ?)
    `);

    insertTx.run(txId, consumerId, pointsToCredit, now);
    db.prepare('UPDATE consumers SET urja_coins = urja_coins + ? WHERE id = ?').run(pointsToCredit, consumerId);

    const afterConsumer = db.prepare('SELECT urja_coins FROM consumers WHERE id = ?').get(consumerId) as any;
    expect(afterConsumer.urja_coins).toBe(initialCoins + pointsToCredit);

    // Attempt duplicate transaction with same ID -> must throw error (dedup protection)
    expect(() => {
      insertTx.run(txId, consumerId, pointsToCredit, now);
    }).toThrow();
  });

  it('should return global reward stats', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/rewards/stats',
      headers: { authorization: `Bearer ${adminToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.overview.totalPointsDistributed).toBeGreaterThan(0);
    expect(body.topConsumers.length).toBeGreaterThan(0);
  });
});
