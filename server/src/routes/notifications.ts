import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';

export async function notificationRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/notifications - user's notifications
  server.get('/', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    const query = req.query as { unread_only?: string; limit?: string };
    const db = getDb();

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: any[] = [user.id];

    if (query.unread_only === 'true' || query.unread_only === '1') {
      sql += ' AND read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Math.min(100, parseInt(query.limit || '50', 10)));

    const notifications = db.prepare(sql).all(...params);
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(user.id) as any;

    return reply.send({
      notifications,
      unreadCount: unreadCount?.count || 0
    });
  });

  // PUT /api/notifications/:id/read - mark read
  server.put('/:id/read', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    const { id } = req.params as { id: string };
    const db = getDb();

    const result = db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(id, user.id);
    if (result.changes === 0) {
      return reply.status(404).send({ error: 'Not Found', message: 'Notification not found' });
    }

    return reply.send({ message: 'Notification marked as read' });
  });

  // PUT /api/notifications/read-all - mark all read
  server.put('/read-all', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    const db = getDb();

    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(user.id);
    return reply.send({ message: 'All notifications marked as read' });
  });
}
