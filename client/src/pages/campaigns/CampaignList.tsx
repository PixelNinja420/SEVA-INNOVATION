import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CAMPAIGNS } from '@/services/api';
import { Campaign, CampaignStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Megaphone, Plus, Search, Calendar, Users, Zap, CheckCircle2 } from 'lucide-react';

export const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Campaign Form State
  const [title, setTitle] = useState('');
  const [targetKW, setTargetKW] = useState('17.4');
  const [durationMins, setDurationMins] = useState('45');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.transformerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: Campaign = {
      id: `cmp-${Date.now()}`,
      title: title || 'Manual Emergency DR Dispatch',
      code: `DR-PAN-${Math.floor(100 + Math.random() * 900)}`,
      transformerId: 'TR-PAN-101',
      transformerName: 'Panaji City Center DT-01',
      feederName: 'Panaji Market Feeder 11kV',
      targetReductionKW: parseFloat(targetKW) || 15.0,
      achievedReductionKW: 0,
      targetDurationMinutes: parseInt(durationMins) || 45,
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      dispatchedBy: 'Grid Operator',
      totalCoinsAllocated: 520,
      consumers: [],
    };
    setCampaigns([newCamp, ...campaigns]);
    setIsCreateOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
            Demand Response Campaigns
          </h1>
          <p className="text-sm text-[#6B7280]">
            Track targeted load shedding dispatches, consumer acceptance rates, and reward disbursements
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create DR Campaign
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
            {['ALL', 'ACTIVE', 'COMPLETED', 'DRAFT', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-[#7F9565] text-white shadow-xs'
                    : 'bg-[#F5F2E9] text-[#6B7280] hover:text-[#191919]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card className="bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Target Transformer</TableHead>
              <TableHead>Target Reduction</TableHead>
              <TableHead>Achieved</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rewards Allocated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((camp) => (
              <TableRow
                key={camp.id}
                className="cursor-pointer"
                onClick={() => navigate(`/campaigns/${camp.id}`)}
              >
                <TableCell>
                  <div className="font-bold text-xs text-[#191919]">{camp.title}</div>
                  <div className="text-[10px] font-mono text-gray-500">{camp.code}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-[#191919]">{camp.transformerName}</div>
                  <div className="text-[10px] text-gray-500">{camp.feederName}</div>
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold">
                  {camp.targetReductionKW} kW
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-[#24845B]">
                      {camp.achievedReductionKW} kW
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-[#24845B]"
                        style={{
                          width: `${Math.min(100, (camp.achievedReductionKW / camp.targetReductionKW) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{camp.targetDurationMinutes} mins</TableCell>
                <TableCell className="font-mono text-xs font-bold text-[#7F9565]">
                  {camp.totalCoinsAllocated} Coins
                </TableCell>
                <TableCell>
                  <StatusBadge status={camp.status} size="sm" />
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/campaigns/${camp.id}`)}
                    className="h-7 text-xs px-2"
                  >
                    View Roster
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Demand Response Campaign"
        description="Dispatch automated load shedding request to consumers connected to an overloaded transformer."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Campaign Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Panaji Urban Evening Overload Shedding"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Reduction (kW)"
              type="number"
              step="0.5"
              value={targetKW}
              onChange={(e) => setTargetKW(e.target.value)}
              required
            />
            <Input
              label="Target Duration (Minutes)"
              type="number"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              required
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Dispatch Campaign
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
