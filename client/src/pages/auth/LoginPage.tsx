import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '@/stores/authStore';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Zap, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsRole } = useAuthStore();

  const [email, setEmail] = useState('operator@urjasync.in');
  const [password, setPassword] = useState('operator123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        if (email.includes('consumer')) {
          navigate('/consumer/home');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid credentials. Try using one-click demo logins below.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleQuickLogin = (role: UserRole) => {
    loginAsRole(role);
    if (role === 'CONSUMER') {
      navigate('/consumer/home');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2E9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171D22] text-[#7F9565] shadow-md">
            <Zap className="h-7 w-7 fill-[#368F8A] text-[#7F9565]" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191919] tracking-tight">
          <span className="text-[#7F9565]">Urja</span>
          <span className="text-[#368F8A]">-Sync</span> Platform
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Sign in to access Distribution Transformer Protection & Demand Dispatch
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 bg-white shadow-lg border-[#E3DED2]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[#D94F45]/10 border border-[#D94F45]/30 text-xs font-medium text-[#D94F45]">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@urjasync.in"
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Console
            </Button>
          </form>

          {/* Quick Demo Login Buttons for Evaluation */}
          <div className="mt-6 pt-5 border-t border-[#E3DED2]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3 text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRoleQuickLogin('GRID_OPERATOR')}
                className="justify-start text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-[#7F9565] mr-2" />
                Grid Operator
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRoleQuickLogin('DISCOM_ADMIN')}
                className="justify-start text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-[#368F8A] mr-2" />
                DISCOM Admin
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRoleQuickLogin('SUPER_ADMIN')}
                className="justify-start text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-[#E56F59] mr-2" />
                Super Admin
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRoleQuickLogin('CONSUMER')}
                className="justify-start text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-[#24845B] mr-2" />
                Smart Consumer (PWA)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
