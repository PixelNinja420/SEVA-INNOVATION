import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { getDatabasePath, getDb } from './database/connection.js';
import { setupDatabase } from './database/setup.js';
import { seedDatabase } from './database/seed.js';
import { setupWebSocket } from './websocket/handler.js';
import { SimulationEngine } from './simulation/engine.js';

// Route imports
import { authRoutes } from './routes/auth.js';
import { regionRoutes } from './routes/regions.js';
import { transformerRoutes } from './routes/transformers.js';
import { consumerRoutes } from './routes/consumers.js';
import { campaignRoutes } from './routes/campaigns.js';
import { predictionRoutes } from './routes/predictions.js';
import { optimizationRoutes } from './routes/optimization.js';
import { simulationRoutes } from './routes/simulation.js';
import { rewardRoutes } from './routes/rewards.js';
import { analyticsRoutes } from './routes/analytics.js';
import { adminRoutes } from './routes/admin.js';
import { notificationRoutes } from './routes/notifications.js';
import { batteryRoutes } from './routes/batteries.js';
import { healthRoutes } from './routes/health.js';

dotenv.config();

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: process.env.NODE_ENV === 'test' ? false : {
      level: process.env.LOG_LEVEL || 'info'
    }
  });

  // 1. CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // 2. Form body parser
  await server.register(formbody);

  // 3. JWT Authentication
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'urja_sync_super_secret_jwt_key_2025'
  });

  // 4. WebSocket Plugin & Handler
  await server.register(websocket);
  setupWebSocket(server);

  // 5. Register API Routes
  await server.register(healthRoutes, { prefix: '/api/health' });
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(regionRoutes, { prefix: '/api/regions' });
  await server.register(transformerRoutes, { prefix: '/api/transformers' });
  await server.register(consumerRoutes, { prefix: '/api/consumers' });
  await server.register(campaignRoutes, { prefix: '/api/campaigns' });
  await server.register(predictionRoutes, { prefix: '/api/predictions' });
  await server.register(optimizationRoutes, { prefix: '/api/optimization' });
  await server.register(simulationRoutes, { prefix: '/api/simulation' });
  await server.register(rewardRoutes, { prefix: '/api/rewards' });
  await server.register(analyticsRoutes, { prefix: '/api/analytics' });
  await server.register(adminRoutes, { prefix: '/api/admin' });
  await server.register(notificationRoutes, { prefix: '/api/notifications' });
  await server.register(batteryRoutes, { prefix: '/api/batteries' });

  // Root route
  server.get('/', async (_req, reply) => {
    return reply.send({
      service: 'Urja-Sync Platform Backend',
      version: '1.0.0',
      status: 'active',
      docs: '/api/health'
    });
  });

  return server;
}

async function start(): Promise<void> {
  const dbPath = getDatabasePath();

  // Initialize database (sql.js is async)
  const { initializeDb } = await import('./database/connection.js');
  
  if (!fs.existsSync(dbPath)) {
    console.log(`Database not found at ${dbPath}, auto-initializing schema and seed data...`);
    await setupDatabase();
    await seedDatabase();
  } else {
    // Ensure DB connection is active
    await initializeDb();
  }

  // Initialize simulation engine
  const simEngine = SimulationEngine.getInstance();
  console.log(`Simulation Engine initialized (status: ${simEngine.getState().status})`);

  const server = await buildServer();
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`🚀 Urja-Sync backend running at http://${host}:${port}`);
    console.log(`⚡ WebSocket endpoint available at ws://${host}:${port}/ws`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  start();
}
