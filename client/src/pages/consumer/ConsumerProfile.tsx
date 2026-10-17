import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Bell, Globe, LogOut, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export const ConsumerProfile: React.FC = () => {
  const { user, logout } = useAuthStore();

  const [language, setLanguage] = useState<'EN' | 'HI' | 'KO'>('EN');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#191919]">
          Consumer Profile & Preferences
        </h1>
        <p className="text-xs text-[#6B7280]">
          Smart grid enrollment credentials and flexibility notification channels
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="p-4 bg-white">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E3DED2]">
          <div className="w-12 h-12 rounded-2xl bg-[#7F9565] text-white flex items-center justify-center font-bold text-lg uppercase">
            {user?.name?.charAt(0) || 'R'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#191919]">{user?.name}</h3>
            <p className="text-xs text-[#6B7280]">{user?.email}</p>
            <p className="text-[11px] font-mono text-[#7F9565] font-semibold mt-0.5">
              Consumer No: GED-PAN-88310
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-3 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Distribution Utility:</span>
            <span className="font-semibold text-[#191919]">Goa Electricity Department (GED)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Assigned Transformer:</span>
            <span className="font-semibold text-[#191919]">Panaji City Center DT-01</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Connected 11kV Feeder:</span>
            <span className="font-semibold text-[#191919]">Panaji Market Feeder 11kV</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Smart Meter Serial:</span>
            <span className="font-mono font-semibold text-[#191919]">SM-GOA-9921</span>
          </div>
        </div>
      </Card>

      {/* Language Selector */}
      <Card className="p-4 bg-white">
        <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#E3DED2]">
          <Globe className="w-4 h-4 text-[#368F8A]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
            Language / भाषा
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setLanguage('EN')}
            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
              language === 'EN'
                ? 'bg-[#7F9565] text-white border-[#7F9565]'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('HI')}
            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
              language === 'HI'
                ? 'bg-[#7F9565] text-white border-[#7F9565]'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => setLanguage('KO')}
            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
              language === 'KO'
                ? 'bg-[#7F9565] text-white border-[#7F9565]'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            कोंकणी (Konkani)
          </button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-4 bg-white">
        <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#E3DED2]">
          <Bell className="w-4 h-4 text-[#E56F59]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
            Demand Response Notifications
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Instant App Push Alerts</span>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={(e) => setPushAlerts(e.target.checked)}
              className="w-4 h-4 text-[#7F9565] rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>WhatsApp Overload Alert Reminders</span>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-4 h-4 text-[#7F9565] rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>SMS Alerts</span>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-[#7F9565] rounded"
            />
          </label>
        </div>
      </Card>

      {/* Sign Out Button */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full text-xs"
        onClick={logout}
        leftIcon={<LogOut className="w-4 h-4" />}
      >
        Sign Out of Consumer PWA
      </Button>
    </div>
  );
};
