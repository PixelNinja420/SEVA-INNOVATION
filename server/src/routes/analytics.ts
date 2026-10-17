import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../database/connection.js';
import { authenticate } from './auth.js';

export async function analyticsRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/analytics/overview - dashboard KPIs
  server.get('/overview', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();

    const tfStats = db.prepare(`
      SELECT 
        COUNT(*) as total_transformers,
        COALESCE(SUM(capacity_kva), 0) as total_capacity_kva,
        COALESCE(SUM(current_load_kw), 0) as total_current_load_kw,
        COALESCE(AVG(loading_pct), 0) as avg_loading_pct,
        COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN status = 'normal' THEN 1 END) as normal_count,
        COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline_count
      FROM transformers
    `).get() as any;

    const consumerStats = db.prepare(`
      SELECT 
        COUNT(*) as total_consumers,
        COUNT(CASE WHEN is_flexible = 1 THEN 1 END) as flexible_consumers,
        COALESCE(SUM(sanctioned_load_kw), 0) as total_sanctioned_kw,
        COALESCE(SUM(urja_coins), 0) as total_coins_in_circulation
      FROM consumers
    `).get() as any;

    const campaignStats = db.prepare(`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
        COALESCE(SUM(achieved_reduction_kw), 0) as total_achieved_reduction_kw,
        COALESCE(SUM(actual_reward_cost), 0) as total_rewards_paid
      FROM demand_response_campaigns
    `).get() as any;

    return reply.send({
      gridOverview: {
        totalTransformers: tfStats.total_transformers,
        totalCapacityKva: tfStats.total_capacity_kva,
        totalCurrentLoadKw: parseFloat(tfStats.total_current_load_kw.toFixed(2)),
        avgLoadingPct: parseFloat(tfStats.avg_loading_pct.toFixed(1)),
        criticalCount: tfStats.critical_count,
        warningCount: tfStats.warning_count,
        normalCount: tfStats.normal_count,
        offlineCount: tfStats.offline_count
      },
      demandResponseOverview: {
        totalConsumers: consumerStats.total_consumers,
        flexibleConsumers: consumerStats.flexible_consumers,
        flexibilityPct: consumerStats.total_consumers > 0 ? parseFloat(((consumerStats.flexible_consumers / consumerStats.total_consumers) * 100).toFixed(1)) : 0,
        totalCoinsCirculation: consumerStats.total_coins_in_circulation,
        activeCampaigns: campaignStats.active_campaigns,
        completedCampaigns: campaignStats.completed_campaigns,
        totalReductionKw: parseFloat(campaignStats.total_achieved_reduction_kw.toFixed(2)),
        totalRewardsPaid: parseFloat(campaignStats.total_rewards_paid.toFixed(2))
      }
    });
  });

  // GET /api/analytics/transformer-health - health distribution
  server.get('/transformer-health', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();

    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM transformers
      GROUP BY status
    `).all();

    const byRisk = db.prepare(`
      SELECT risk_level, COUNT(*) as count
      FROM transformers
      GROUP BY risk_level
    `).all();

    const highRiskTransformers = db.prepare(`
      SELECT id, name, capacity_kva, current_load_kw, loading_pct, temperature_c, status, risk_level, region_id
      FROM transformers
      WHERE risk_level IN ('CRITICAL', 'WARNING') OR loading_pct >= 80
      ORDER BY loading_pct DESC
      LIMIT 10
    `).all();

    return reply.send({
      byStatus,
      byRisk,
      highRiskTransformers
    });
  });

  // GET /api/analytics/load-trends - load over time
  server.get('/load-trends', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();

    const recentReadings = db.prepare(`
      SELECT 
        strftime('%H:%M', timestamp) as time_slot,
        AVG(value) as avg_power_kw,
        MAX(value) as peak_power_kw,
        COUNT(*) as sample_count
      FROM telemetry_readings
      WHERE sensor_type = 'active_power_kw'
      GROUP BY time_slot
      ORDER BY time_slot DESC
      LIMIT 24
    `).all();

    return reply.send({ trends: recentReadings.reverse() });
  });

  // GET /api/analytics/campaign-performance - campaign stats
  server.get('/campaign-performance', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();

    const campaigns = db.prepare(`
      SELECT 
        drc.id, drc.reason, drc.status, drc.target_reduction_kw, drc.achieved_reduction_kw,
        drc.estimated_reward_cost, drc.actual_reward_cost, drc.created_at,
        t.name as transformer_name,
        (SELECT COUNT(*) FROM campaign_consumers cc WHERE cc.campaign_id = drc.id) as total_invited,
        (SELECT COUNT(*) FROM campaign_consumers cc WHERE cc.campaign_id = drc.id AND cc.status = 'accepted') as total_accepted
      FROM demand_response_campaigns drc
      JOIN transformers t ON drc.transformer_id = t.id
      ORDER BY drc.created_at DESC
      LIMIT 15
    `).all();

    return reply.send({ campaigns });
  });

  // GET /api/analytics/financial - financial impact data
  server.get('/financial', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();

    const stats = db.prepare(`
      SELECT 
        COALESCE(SUM(achieved_reduction_kw), 0) as total_curtailed_kw,
        COALESCE(SUM(actual_reward_cost), 0) as total_incentives_paid
      FROM demand_response_campaigns
      WHERE status IN ('active', 'completed')
    `).get() as any;

    const peakPowerCostPerKwh = 16.0; // Market peak purchase tariff (INR)
    const incentivePerKwh = 12.0; // DR incentive (INR)
    const avoidedDamageEstPerKw = 350.0; // Equipment loss of life protection value

    const curtailedKw = stats.total_curtailed_kw;
    const incentivesPaid = stats.total_incentives_paid || (curtailedKw * incentivePerKwh);
    const avoidedPeakCost = curtailedKw * peakPowerCostPerKwh;
    const avoidedAssetDamage = curtailedKw * avoidedDamageEstPerKw;
    const netSavings = avoidedPeakCost + avoidedAssetDamage - incentivesPaid;

    return reply.send({
      financialImpact: {
        totalCurtailedKw: parseFloat(curtailedKw.toFixed(2)),
        totalIncentivesPaidInr: parseFloat(incentivesPaid.toFixed(2)),
        avoidedPeakPurchaseCostInr: parseFloat(avoidedPeakCost.toFixed(2)),
        avoidedEquipmentDegradationInr: parseFloat(avoidedAssetDamage.toFixed(2)),
        netBenefitInr: parseFloat(netSavings.toFixed(2)),
        roiRatio: incentivesPaid > 0 ? parseFloat(((avoidedPeakCost + avoidedAssetDamage) / incentivesPaid).toFixed(2)) : 0
      }
    });
  });

  // GET /api/analytics/export/csv - CSV export
  server.get('/export/csv', { preHandler: [authenticate] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const rows = db.prepare(`
      SELECT 
        t.id, t.name, r.name as region, f.name as feeder,
        t.capacity_kva, t.current_load_kw, t.loading_pct,
        t.temperature_c, t.status, t.risk_level, t.connected_consumers,
        t.last_telemetry_at
      FROM transformers t
      JOIN regions r ON t.region_id = r.id
      JOIN feeders f ON t.feeder_id = f.id
      ORDER BY t.loading_pct DESC
    `).all() as any[];

    const headers = ['ID', 'Name', 'Region', 'Feeder', 'Capacity (kVA)', 'Current Load (kW)', 'Loading (%)', 'Temp (C)', 'Status', 'Risk Level', 'Consumers', 'Last Telemetry'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      csvLines.push([
        `"${r.id}"`,
        `"${r.name}"`,
        `"${r.region}"`,
        `"${r.feeder}"`,
        r.capacity_kva,
        r.current_load_kw,
        r.loading_pct,
        r.temperature_c,
        `"${r.status}"`,
        `"${r.risk_level}"`,
        r.connected_consumers,
        `"${r.last_telemetry_at || ''}"`
      ].join(','));
    }

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="transformers_analytics.csv"');
    return reply.send(csvLines.join('\n'));
  });
}
