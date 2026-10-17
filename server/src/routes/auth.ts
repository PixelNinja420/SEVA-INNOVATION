import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { UserRole } from '../types/index.js';

export async function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await (req as any).jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing authentication token' });
  }
}

export function authorize(allowedRoles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = req.user as any;
    if (!user || !allowedRoles.includes(user.role)) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `Role ${user?.role || 'anonymous'} is not authorized for this resource.`
      });
    }
  };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR', 'CONSUMER']),
  discom_id: z.string().optional().nullable(),
  region_id: z.string().optional().nullable()
});

export async function authRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/auth/login
  server.post('/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parseResult.error.format() });
    }

    const { email, password } = parseResult.data;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      discom_id: user.discom_id,
      region_id: user.region_id
    };

    const token = (server as any).jwt.sign(payload, { expiresIn: '7d' });

    // Record audit log
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, result, ip_address, created_at)
      VALUES (?, ?, 'LOGIN', 'users', ?, 'SUCCESS', ?, datetime('now'))
    `).run(uuidv4(), user.id, user.id, req.ip);

    return reply.send({
      token,
      user: payload
    });
  });

  // POST /api/auth/register (Admin only)
  server.post('/register', { preHandler: [authenticate, authorize(['SUPER_ADMIN', 'DISCOM_ADMIN'])] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parseResult.error.format() });
    }

    const { email, password, name, role, discom_id, region_id } = parseResult.data;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return reply.status(409).send({ error: 'Conflict', message: 'User with this email already exists' });
    }

    const newId = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, discom_id, region_id, created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(newId, email, hash, name, role, discom_id || null, region_id || null, now, now);

    return reply.status(201).send({
      id: newId,
      email,
      name,
      role,
      discom_id: discom_id || null,
      region_id: region_id || null,
      created_at: now
    });
  });

  // GET /api/auth/me
  server.get('/me', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const userPayload = req.user as any;
    const db = getDb();
    const user = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.discom_id, u.region_id, u.created_at,
             d.name as discom_name, r.name as region_name
      FROM users u
      LEFT JOIN discoms d ON u.discom_id = d.id
      LEFT JOIN regions r ON u.region_id = r.id
      WHERE u.id = ? AND u.is_active = 1
    `).get(userPayload.id) as any;

    if (!user) {
      return reply.status(404).send({ error: 'Not Found', message: 'User not found or inactive' });
    }

    return reply.send({ user });
  });
}
