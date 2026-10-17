import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import fs from 'fs';
import { getDb, getDatabasePath } from '../database/connection.js';
import { authenticate, authorize } from './auth.js';
import { getConnectedClientCount } from '../websocket/handler.js';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR', 'CONSUMER']),
  discom_id: z.string().optional().nullable(),
  region_id: z.string().optional().nullable(),
  is_active: z.number().int().min(0).max(1).default(1)
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR', 'CONSUMER']).optional(),
  password: z.string().min(6).optional(),
  discom_id: z.string().optional().nullable(),
  region_id: z.string().optional().nullable(),
  is_active: z.number().int().min(0).max(1).optional()
});

export async function adminRoutes(server: FastifyInstance): Promise<void> {
  const adminGuard = [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN'])];

  // GET /api/admin/users - list users
  server.get('/users', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    const db = getDb();

    let sql = `
      SELECT u.id, u.email, u.name, u.role, u.discom_id, u.region_id,
             u.is_active, u.created_at, u.updated_at,
             d.name as discom_name, r.name as region_name
      FROM users u
      LEFT JOIN discoms d ON u.discom_id = d.id
      LEFT JOIN regions r ON u.region_id = r.id
    `;
    const params: any[] = [];

    if (user.role === 'DISCOM_ADMIN' && user.discom_id) {
      sql += ' WHERE u.discom_id = ?';
      params.push(user.discom_id);
    }

    sql += ' ORDER BY u.created_at DESC';
    const users = db.prepare(sql).all(...params);
    return reply.send({ users });
  });

  // POST /api/admin/users - create user
  server.post('/users', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const db = getDb();
    const data = parse.data;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) {
      return reply.status(409).send({ error: 'Conflict', message: 'User with this email already exists' });
    }

    const newId = uuidv4();
    const hash = bcrypt.hashSync(data.password, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, discom_id, region_id, created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, data.email, hash, data.name, data.role, data.discom_id || null, data.region_id || null, now, now, data.is_active);

    const created = db.prepare(`
      SELECT id, email, name, role, discom_id, region_id, is_active, created_at
      FROM users WHERE id = ?
    `).get(newId);

    return reply.status(201).send({ user: created });
  });

  // PUT /api/admin/users/:id - update user
  server.put('/users/:id', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parse = updateUserSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }

    const data = parse.data;
    const sets: string[] = ['updated_at = ?'];
    const params: any[] = [new Date().toISOString()];

    if (data.name !== undefined) {
      sets.push('name = ?');
      params.push(data.name);
    }
    if (data.role !== undefined) {
      sets.push('role = ?');
      params.push(data.role);
    }
    if (data.is_active !== undefined) {
      sets.push('is_active = ?');
      params.push(data.is_active);
    }
    if (data.discom_id !== undefined) {
      sets.push('discom_id = ?');
      params.push(data.discom_id);
    }
    if (data.region_id !== undefined) {
      sets.push('region_id = ?');
      params.push(data.region_id);
    }
    if (data.password !== undefined) {
      sets.push('password_hash = ?');
      params.push(bcrypt.hashSync(data.password, 10));
    }

    params.push(id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(`
      SELECT id, email, name, role, discom_id, region_id, is_active, updated_at
      FROM users WHERE id = ?
    `).get(id);

    return reply.send({ user: updated });
  });

  // GET /api/admin/audit-logs - audit logs
  server.get('/audit-logs', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { limit?: string; action?: string };
    const db = getDb();

    let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query.action) {
      sql += ' AND al.action = ?';
      params.push(query.action);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(Math.min(200, parseInt(query.limit || '50', 10)));

    const logs = db.prepare(sql).all(...params);
    return reply.send({ logs });
  });

  // GET /api/admin/system-health - system health
  server.get('/system-health', { preHandler: adminGuard }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const memory = process.memoryUsage();
    let dbSize = 0;
    try {
      const stats = fs.statSync(getDatabasePath());
      dbSize = stats.size;
    } catch {
      // ignore
    }

    return reply.send({
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        rssMb: parseFloat((memory.rss / (1024 * 1024)).toFixed(1)),
        heapUsedMb: parseFloat((memory.heapUsed / (1024 * 1024)).toFixed(1)),
        heapTotalMb: parseFloat((memory.heapTotal / (1024 * 1024)).toFixed(1))
      },
      database: {
        engine: 'sql.js (SQLite)',
        sizeKb: parseFloat((dbSize / 1024).toFixed(1)),
        mode: 'WAL'
      },
      websocketClients: getConnectedClientCount(),
      nodeVersion: process.version
    });
  });

  // GET /api/admin/settings - get settings
  server.get('/settings', { preHandler: adminGuard }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value, updated_at FROM system_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return reply.send({ settings });
  });

  // PUT /api/admin/settings - update settings
  server.put('/settings', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as Record<string, any>;
    if (!body || typeof body !== 'object') {
      return reply.status(400).send({ error: 'Validation Error', message: 'Settings must be a key-value object' });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const insertOrReplace = db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    const tx = db.transaction(() => {
      for (const [key, val] of Object.entries(body)) {
        insertOrReplace.run(key, String(val), now);
      }
    });
    tx();

    return reply.send({ message: 'Settings updated successfully' });
  });
}
