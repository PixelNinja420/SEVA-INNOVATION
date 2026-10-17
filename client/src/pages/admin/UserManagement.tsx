import React, { useState } from 'react';
import { User, UserRole } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Users, Plus, Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Priya Sharma', email: 'admin@urjasync.in', role: 'SUPER_ADMIN' },
    { id: '2', name: 'Dr. Ramesh Sawant', email: 'discom@urjasync.in', role: 'DISCOM_ADMIN' },
    { id: '3', name: 'Arjun Rao', email: 'operator@urjasync.in', role: 'GRID_OPERATOR' },
    { id: '4', name: 'Sunil Naik', email: 'field@urjasync.in', role: 'FIELD_ENGINEER' },
    { id: '5', name: 'Rajesh Kamat', email: 'consumer@urjasync.in', role: 'CONSUMER' },
  ]);

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('GRID_OPERATOR');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
    };
    setUsers([...users, newUser]);
    setIsDialogOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
            User & Role Management
          </h1>
          <p className="text-sm text-[#6B7280]">
            Manage operator credentials, role-based access control (RBAC), and user provisioning
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New User
        </Button>
      </div>

      <Card className="p-4 bg-white">
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </Card>

      <Card className="bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold text-xs text-[#191919]">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#7F9565]/20 text-[#6B7F52] flex items-center justify-center font-bold text-xs uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600">{u.email}</TableCell>
                <TableCell>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#368F8A]/10 text-[#368F8A] border border-[#368F8A]/30">
                    {u.role.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center text-xs font-semibold text-[#24845B]">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add Grid User"
        description="Assign role and permissions for Urja-Sync platform access."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Prabhu"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rprabhu@ged.gov.in"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#191919] mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 px-3 rounded-lg border border-[#E3DED2] bg-white text-xs font-semibold text-[#191919] focus:outline-none"
            >
              <option value="GRID_OPERATOR">GRID_OPERATOR</option>
              <option value="DISCOM_ADMIN">DISCOM_ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="FIELD_ENGINEER">FIELD_ENGINEER</option>
              <option value="CONSUMER">CONSUMER</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create User
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
