import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../index.js';
import { seedDatabase } from '../database/seed.js';
import { closeDb } from '../database/connection.js';

describe('Authentication API & JWT Middleware', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedDatabase(process.env.DATABASE_PATH);
    server = await buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
    closeDb();
  });

  it('should successfully log in super admin and return JWT', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'super@urjasync.demo',
        password: 'SuperAdmin@123'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.token).toBeDefined();
    expect(body.user.role).toBe('SUPER_ADMIN');
    expect(body.user.email).toBe('super@urjasync.demo');
  });

  it('should reject login with wrong password', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'super@urjasync.demo',
        password: 'WrongPassword'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should get current user profile with valid JWT via /api/auth/me', async () => {
    // 1. Login first
    const loginRes = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'operator@urjasync.demo',
        password: 'Operator@123'
      }
    });

    const token = JSON.parse(loginRes.body).token;

    // 2. Query /me
    const meRes = await server.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(meRes.statusCode).toBe(200);
    const meBody = JSON.parse(meRes.body);
    expect(meBody.user.role).toBe('GRID_OPERATOR');
    expect(meBody.user.name).toContain('Operator');
  });

  it('should reject unauthenticated request to protected endpoint', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/auth/me'
    });

    expect(res.statusCode).toBe(401);
  });
});
