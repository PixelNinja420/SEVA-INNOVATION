import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { FileText, Search, ShieldCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredLogs = MOCK_AUDIT_LOGS.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
          Regulatory & Operational Audit Trail
        </h1>
        <p className="text-sm text-[#6B7280]">
          Cryptographically timestamped record of grid dispatch decisions, AI predictions, and parameter modifications
        </p>
      </div>

      <Card className="p-4 bg-white">
        <Input
          placeholder="Search audit trail by operator, action, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </Card>

      <Card className="bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <span className="font-bold text-xs text-[#191919]">{log.userName}</span>
                  <div className="text-[10px] text-gray-500">{log.userRole}</div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-[#7F9565] bg-[#7F9565]/10 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-medium text-gray-700">
                  {log.resourceType}
                </TableCell>
                <TableCell className="text-xs text-gray-600 max-w-md">
                  {log.details}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-400">
                  {log.ipAddress}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
