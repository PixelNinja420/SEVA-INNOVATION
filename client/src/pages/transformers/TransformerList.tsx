import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/stores/simulationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Search, Download, Filter, Zap, ArrowUpDown } from 'lucide-react';

export const TransformerList: React.FC = () => {
  const navigate = useNavigate();
  const { transformers } = useSimulationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'name' | 'loadingPercentage' | 'oilTemperature'>('loadingPercentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransformers = transformers
    .filter((tr) => {
      const matchSearch =
        tr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.feederName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || tr.status === statusFilter;
      const matchRisk = riskFilter === 'ALL' || tr.riskLevel === riskFilter;
      return matchSearch && matchStatus && matchRisk;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleExportCSV = () => {
    const headers = 'ID,Name,Region,Feeder,Capacity_kVA,Load_kW,Loading_Pct,Oil_Temp_C,Status,Risk\n';
    const rows = filteredTransformers
      .map(
        (t) =>
          `"${t.code}","${t.name}","${t.regionName}","${t.feederName}",${t.capacityKVA},${t.currentLoadKW},${t.loadingPercentage},${t.oilTemperature},"${t.status}","${t.riskLevel}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformers_fleet_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleSort = (field: 'name' | 'loadingPercentage' | 'oilTemperature') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
            Distribution Transformers Fleet
          </h1>
          <p className="text-sm text-[#6B7280]">
            Monitoring telemetry, thermal indices, and predictive overload risks across all feeders
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4 text-[#7F9565]" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by name, code, feeder, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E3DED2] bg-white text-xs font-semibold text-[#191919] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="WATCH">Watch Only</option>
              <option value="NORMAL">Normal Only</option>
              <option value="OFFLINE">Offline Only</option>
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E3DED2] bg-white text-xs font-semibold text-[#191919] focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Fleet Table */}
      <Card className="bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                sortable
                sortDirection={sortField === 'name' ? sortOrder : null}
                onSort={() => handleSort('name')}
              >
                Transformer
              </TableHead>
              <TableHead>Region & Feeder</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Current Load</TableHead>
              <TableHead
                sortable
                sortDirection={sortField === 'loadingPercentage' ? sortOrder : null}
                onSort={() => handleSort('loadingPercentage')}
              >
                Loading %
              </TableHead>
              <TableHead
                sortable
                sortDirection={sortField === 'oilTemperature' ? sortOrder : null}
                onSort={() => handleSort('oilTemperature')}
              >
                Oil Temp
              </TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransformers.length > 0 ? (
              filteredTransformers.map((tr) => (
                <TableRow
                  key={tr.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/transformers/${tr.id}`)}
                >
                  <TableCell>
                    <div className="font-bold text-[#191919]">{tr.name}</div>
                    <div className="text-[11px] font-mono text-[#6B7280]">{tr.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-[#191919]">{tr.feederName}</div>
                    <div className="text-[11px] text-[#6B7280]">{tr.regionName}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tr.capacityKVA} kVA</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{tr.currentLoadKW} kW</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono font-bold text-xs ${
                          tr.loadingPercentage >= 100
                            ? 'text-[#D94F45]'
                            : tr.loadingPercentage >= 85
                            ? 'text-[#E5A23D]'
                            : 'text-[#24845B]'
                        }`}
                      >
                        {tr.loadingPercentage}%
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            tr.loadingPercentage >= 100
                              ? 'bg-[#D94F45]'
                              : tr.loadingPercentage >= 85
                              ? 'bg-[#E5A23D]'
                              : 'bg-[#24845B]'
                          }`}
                          style={{ width: `${Math.min(100, tr.loadingPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tr.oilTemperature}°C</TableCell>
                  <TableCell>
                    <StatusBadge status={tr.riskLevel} size="sm" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tr.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/optimization?transformerId=${tr.id}`)}
                      className="h-7 text-xs px-2"
                    >
                      DR Solve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-[#6B7280]">
                  No transformers matching criteria found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
