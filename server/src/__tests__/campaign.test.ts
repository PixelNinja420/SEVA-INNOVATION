import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../index.js';
import { seedDatabase } from '../database/seed.js';
import { closeDb } from '../database/connection.js';

describe('Demand Response Campaign Lifecycle', () => {
  let server: FastifyInstance;
  let operatorToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedDatabase(process.env.DATABASE_PATH);
    server = await buildServer();
    await server.ready();

    // Login as operator
    const loginRes = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'operator@urjasync.demo',
        password: 'Operator@123'
      }
    });
    operatorToken = JSON.parse(loginRes.body).token;
  });

  afterAll(async () => {
    await server.close();
    closeDb();
  });

  it('should create, approve, respond to, and view results of a campaign', async () => {
    // 1. Create a campaign
    const createRes = await server.inject({
      method: 'POST',
      url: '/api/campaigns',
      headers: { authorization: `Bearer ${operatorToken}` },
      payload: {
        transformer_id: 'tr-reg-panaji-f1-1',
        region_id: 'reg-panaji',
        target_reduction_kw: 15.0,
        reason: 'Relieve afternoon peak thermal overload',
        selected_consumers: [
          {
            consumer_id: 'cons-001',
            appliance_id: 'app-cons-001-1',
            flexible_load_kw: 7.4,
            reward_offered: 111.0
          },
          {
            consumer_id: 'cons-002',
            appliance_id: 'app-cons-002-1',
            flexible_load_kw: 8.0,
            reward_offered: 120.0
          }
        ]
      }
    });

    expect(createRes.statusCode).toBe(201);
    const createdCampaign = JSON.parse(createRes.body).campaign;
    expect(createdCampaign.id).toBeDefined();
    expect(createdCampaign.status).toBe('pending_approval');
    expect(createdCampaign.target_reduction_kw).toBe(15.0);

    const campaignId = createdCampaign.id;

    // 2. Approve the campaign
    const approveRes = await server.inject({
      method: 'PUT',
      url: `/api/campaigns/${campaignId}/approve`,
      headers: { authorization: `Bearer ${operatorToken}` }
    });

    expect(approveRes.statusCode).toBe(200);
    const approvedCampaign = JSON.parse(approveRes.body).campaign;
    expect(approvedCampaign.status).toBe('active');

    // 3. Consumer responds to campaign invitation
    const respondRes = await server.inject({
      method: 'POST',
      url: `/api/campaigns/${campaignId}/respond`,
      headers: { authorization: `Bearer ${operatorToken}` },
      payload: {
        consumer_id: 'cons-001',
        status: 'accepted'
      }
    });

    expect(respondRes.statusCode).toBe(200);
    const invitation = JSON.parse(respondRes.body).invitation;
    expect(invitation.status).toBe('accepted');

    // 4. Check campaign results
    const resultsRes = await server.inject({
      method: 'GET',
      url: `/api/campaigns/${campaignId}/results`,
      headers: { authorization: `Bearer ${operatorToken}` }
    });

    expect(resultsRes.statusCode).toBe(200);
    const results = JSON.parse(resultsRes.body);
    expect(results.metrics.total_invited).toBe(2);
    expect(results.metrics.accepted_count).toBe(1);
    expect(results.metrics.committed_reduction_kw).toBe(7.4);
  });
});
