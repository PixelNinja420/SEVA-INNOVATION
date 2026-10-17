import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';

// Pages
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OperatorDashboard } from '@/pages/dashboard/OperatorDashboard';
import { GridSimulationLab } from '@/pages/simulation/GridSimulationLab';
import { GridMap } from '@/pages/map/GridMap';
import { TransformerList } from '@/pages/transformers/TransformerList';
import { TransformerDetail } from '@/pages/transformers/TransformerDetail';
import { PredictionDashboard } from '@/pages/predictions/PredictionDashboard';
import { OptimizationDashboard } from '@/pages/optimization/OptimizationDashboard';
import { CampaignList } from '@/pages/campaigns/CampaignList';
import { CampaignDetail } from '@/pages/campaigns/CampaignDetail';
import { ConsumerHome } from '@/pages/consumer/ConsumerHome';
import { ConsumerAlerts } from '@/pages/consumer/ConsumerAlerts';
import { ConsumerRewards } from '@/pages/consumer/ConsumerRewards';
import { ConsumerEnergy } from '@/pages/consumer/ConsumerEnergy';
import { ConsumerProfile } from '@/pages/consumer/ConsumerProfile';
import { SuperAdminDashboard } from '@/pages/admin/SuperAdminDashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { SystemConfig } from '@/pages/admin/SystemConfig';
import { AuditLogsPage } from '@/pages/admin/AuditLogsPage';
import { DiscomDashboard } from '@/pages/discom/DiscomDashboard';
import { AnalyticsDashboard } from '@/pages/analytics/AnalyticsDashboard';
import { ROICalculator } from '@/pages/financial/ROICalculator';
import { BatteryDashboard } from '@/pages/batteries/BatteryDashboard';
import { GuidedDemo } from '@/pages/demo/GuidedDemo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If consumer tries to access operator views, redirect to consumer home
    if (user.role === 'CONSUMER') {
      return <Navigate to="/consumer/home" replace />;
    }
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Consumer Mobile PWA Routes */}
          <Route
            path="/consumer"
            element={
              <ProtectedRoute>
                <ConsumerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/consumer/home" replace />} />
            <Route path="home" element={<ConsumerHome />} />
            <Route path="alerts" element={<ConsumerAlerts />} />
            <Route path="rewards" element={<ConsumerRewards />} />
            <Route path="energy" element={<ConsumerEnergy />} />
            <Route path="profile" element={<ConsumerProfile />} />
          </Route>

          {/* Grid Operator & Admin Console Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<OperatorDashboard />} />
            <Route path="/simulation" element={<GridSimulationLab />} />
            <Route path="/map" element={<GridMap />} />
            <Route path="/transformers" element={<TransformerList />} />
            <Route path="/transformers/:id" element={<TransformerDetail />} />
            <Route path="/predictions" element={<PredictionDashboard />} />
            <Route path="/optimization" element={<OptimizationDashboard />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/financial" element={<ROICalculator />} />
            <Route path="/batteries" element={<BatteryDashboard />} />
            <Route path="/demo" element={<GuidedDemo />} />
            <Route path="/discom" element={<DiscomDashboard />} />
            <Route path="/admin" element={<SuperAdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/config" element={<SystemConfig />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
