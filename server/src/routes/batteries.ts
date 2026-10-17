import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';

const dischargeSchema = z.object({
  power_kw: z.number().positive(),
  duration_minutes: z.number().positive().max(480)
});

export async function batteryRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/batteries - list batteries and V2G resources
  server.get('/', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { region_id?: string };
    const db = getDb();

    let batterySql = 'SELECT b.*, r.name as region_name FROM batteries b JOIN regions r ON b.region_id = r.id WHERE 1=1';
    let v2gSql = 'SELECT v.*, r.name as region_name FROM v2g_resources v JOIN regions r ON v.region_id = r.id WHERE 1=1';
    const params: any[] = [];

    if (query.region_id) {
      batterySql += ' AND b.region_id = ?';
      v2gSql += ' AND v.region_id = ?';
      params.push(query.region_id);
    }

    const batteries = db.prepare(batterySql).all(...params);
    const v2gResources = db.prepare(v2gSql).all(...params);

    return reply.send({
      batteries,
      v2gResources
    });
  });

  // GET /api/batteries/:id - battery detail
  server.get('/:id', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const db = getDb();

    const battery = db.prepare(`
      SELECT b.*, r.name as region_name
      FROM batteries b
      JOIN regions r ON b.region_id = r.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!battery) {
      return reply.status(404).send({ error: 'Not Found', message: 'Battery not found' });
    }

    const linkedV2G = db.prepare('SELECT * FROM v2g_resources WHERE battery_id = ?').all(id);

    return reply.send({
      battery,
      linkedV2G
    });
  });

  // POST /api/batteries/:id/discharge - simulate discharge
  server.post('/:id/discharge', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parse = dischargeSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parse.error.format() });
    }

    const { power_kw, duration_minutes } = parse.data;
    const db = getDb();

    const battery = db.prepare('SELECT * FROM batteries WHERE id = ?').get(id) as any;
    if (!battery) {
      return reply.status(404).send({ error: 'Not Found', message: 'Battery not found' });
    }

    if (power_kw > battery.discharge_power_kw) {
      return reply.status(400).send({
        error: 'Invalid Request',
        message: `Requested discharge power ${power_kw} kW exceeds rated max discharge rate ${battery.discharge_power_kw} kW`
      });
    }

    // Energy needed in kWh
    const energyRequiredKwh = power_kw * (duration_minutes / 60) / (battery.efficiency || 0.92);
    const currentEnergyKwh = battery.capacity_kwh * (battery.current_soc_pct / 100);
    const minReserveKwh = battery.capacity_kwh * 0.15; // 15% depth of discharge limit

    if (currentEnergyKwh - energyRequiredKwh < minReserveKwh) {
      return reply.status(400).send({
        error: 'Insufficient Reserve',
        message: `Discharging would drop SOC below safety reserve (15%). Max available discharge energy is ${(currentEnergyKwh - minReserveKwh).toFixed(1)} kWh.`
      });
    }

    const newSocPct = parseFloat((((currentEnergyKwh - energyRequiredKwh) / battery.capacity_kwh) * 100).toFixed(1));

    db.prepare('UPDATE batteries SET current_soc_pct = ?, status = "discharging" WHERE id = ?')
      .run(newSocPct, id);

    const updated = db.prepare('SELECT * FROM batteries WHERE id = ?').get(id);

    return reply.send({
      message: 'Battery discharge active',
      dischargedEnergyKwh: parseFloat(energyRequiredKwh.toFixed(2)),
      durationMinutes: duration_minutes,
      powerKw: power_kw,
      battery: updated
    });
  });
}
