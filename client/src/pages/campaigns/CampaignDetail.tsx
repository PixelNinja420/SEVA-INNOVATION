import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CAMPAIGNS } from '@/services/api';
import { Campaign } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Zap, Coins, Users, ShieldAlert } from 'lucide-react';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign>(
    MOCK_CAMPAIGNS.find((c) => c.id === id) || MOCK_CAMPAIGNS[0]
  );

  const completionPct = Math.min(
    100,
    parseFloat(((campaign.achievedReductionKW / campaign.targetReductionKW) * 100).toFixed(1))
  );

  const handleApprove = () => {
    setCampaign({ ...campaign, status: 'COMPLETED' });
  };

  const handleCancel = () => {
    setCampaign({ ...campaign, status: 'CANCELLED' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/campaigns')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Campaigns
          </Button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
                {campaign.title}
              </h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-xs text-[#6B7280] font-mono mt-0.5">
              {campaign.code} • Transformer: {campaign.transformerName} • Feeder: {campaign.feederName}
            </p>
          </div>
        </div>

        {campaign.status === 'ACTIVE' && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel Campaign
            </Button>
            <Button variant="primary" size="sm" onClick={handleApprove}>
              Complete & Disburse Coins
            </Button>
          </div>
        )}
      </div>

      {/* Progress & Reduction Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Target Reduction
          </span>
          <p className="text-3xl font-extrabold font-mono text-[#191919] mt-1">
            {campaign.targetReductionKW} kW
          </p>
          <p className="text-xs text-[#6B7280]">Requested capacity relief</p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Achieved Shedding
          </span>
          <p className="text-3xl font-extrabold font-mono text-[#24845B] mt-1">
            {campaign.achievedReductionKW} kW
          </p>
          <p className="text-xs text-[#24845B] font-semibold">{completionPct}% of target fulfilled</p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Allocated Rewards
          </span>
          <p className="text-3xl font-extrabold font-mono text-[#7F9565] mt-1">
            {campaign.totalCoinsAllocated} Coins
          </p>
          <p className="text-xs text-[#6B7280]">Approx. ₹{(campaign.totalCoinsAllocated * 3).toLocaleString('en-IN')}</p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Target Window
          </span>
          <p className="text-3xl font-extrabold font-mono text-[#368F8A] mt-1">
            {campaign.targetDurationMinutes} Mins
          </p>
          <p className="text-xs text-[#6B7280]">Started: {campaign.startTime.slice(11, 16)}</p>
        </Card>
      </div>

      {/* Progress Bar Banner */}
      <Card className="p-5 bg-white">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#191919]">Target Reduction Fulfilled</span>
          <span className="text-[#24845B] font-mono font-bold">
            {campaign.achievedReductionKW} / {campaign.targetReductionKW} kW ({completionPct}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-[#24845B] transition-all duration-500 rounded-full"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </Card>

      {/* Participant Consumers Roster */}
      <Card className="bg-white overflow-hidden">
        <div className="p-4 border-b border-[#E3DED2] flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#191919]">
            Enrolled Consumer Response & Load Shedding Roster
          </h3>
          <span className="text-xs font-semibold text-[#7F9565]">
            {campaign.consumers.length} Dispatched Consumers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F2E9] text-[#6B7280] uppercase text-[10px]">
              <tr>
                <th className="p-3">Consumer</th>
                <th className="p-3">Target Appliance</th>
                <th className="p-3">Requested Shed</th>
                <th className="p-3">Verified Shed</th>
                <th className="p-3">Reward Offered</th>
                <th className="p-3">Response Status</th>
                <th className="p-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DED2]">
              {campaign.consumers.map((c, i) => (
                <tr key={i} className="hover:bg-[#F5F2E9]/40">
                  <td className="p-3">
                    <div className="font-semibold text-xs text-[#191919]">{c.consumerName}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{c.consumerNumber}</div>
                  </td>
                  <td className="p-3 font-medium text-gray-800">{c.applianceName}</td>
                  <td className="p-3 font-mono font-semibold">{c.requestedReductionKW} kW</td>
                  <td className="p-3 font-mono font-bold text-[#24845B]">
                    {c.verifiedReductionKW || c.requestedReductionKW} kW
                  </td>
                  <td className="p-3 font-mono font-bold text-[#7F9565]">
                    {c.rewardOfferedCoins} Coins
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#24845B]/15 text-[#24845B]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {c.responseStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-gray-500">{c.respondedAt || 'Just now'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
