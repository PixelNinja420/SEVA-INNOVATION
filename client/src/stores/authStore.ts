import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { apiClient } from '@/services/api';

export const DEMO_USERS: Record<UserRole, User> = {
  SUPER_ADMIN: {
    id: 'usr-admin',
    name: 'Priya Sharma (Super Admin)',
    email: 'admin@urjasync.in',
    role: 'SUPER_ADMIN',
    regionId: 'reg-panaji-urban',
    discomId: 'ged-goa',
  },
  DISCOM_ADMIN: {
    id: 'usr-discom',
    name: 'Dr. Ramesh Sawant (GED Chief Engineer)',
    email: 'discom@urjasync.in',
    role: 'DISCOM_ADMIN',
    regionId: 'reg-panaji-urban',
    discomId: 'ged-goa',
  },
  GRID_OPERATOR: {
    id: 'usr-operator',
    name: 'Arjun Rao (Senior Grid Dispatcher)',
    email: 'operator@urjasync.in',
    role: 'GRID_OPERATOR',
    regionId: 'reg-panaji-urban',
    discomId: 'ged-goa',
  },
  FIELD_ENGINEER: {
    id: 'usr-field',
    name: 'Sunil Naik (Panaji Circle Engineer)',
    email: 'field@urjasync.in',
    role: 'FIELD_ENGINEER',
    regionId: 'reg-panaji-urban',
    discomId: 'ged-goa',
  },
  CONSUMER: {
    id: 'usr-consumer',
    name: 'Rajesh Kamat (Smart Consumer)',
    email: 'consumer@urjasync.in',
    role: 'CONSUMER',
    regionId: 'reg-panaji-urban',
    discomId: 'ged-goa',
    coins: 420,
    meterId: 'SM-GOA-9921',
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize with operator as default for immediate usability, or restore from storage
  const storedUser = localStorage.getItem('urja_user');
  const storedToken = localStorage.getItem('urja_auth_token');

  let initialUser = DEMO_USERS.GRID_OPERATOR;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      initialUser = DEMO_USERS.GRID_OPERATOR;
    }
  }

  return {
    user: initialUser,
    token: storedToken || 'mock-demo-jwt-token-urja-sync',
    isAuthenticated: true,

    login: async (email: string, _password?: string) => {
      // Find matching demo user by email or default to operator
      const lower = email.toLowerCase().trim();
      let matchedUser = DEMO_USERS.GRID_OPERATOR;

      if (lower.includes('admin')) matchedUser = DEMO_USERS.SUPER_ADMIN;
      else if (lower.includes('discom')) matchedUser = DEMO_USERS.DISCOM_ADMIN;
      else if (lower.includes('field')) matchedUser = DEMO_USERS.FIELD_ENGINEER;
      else if (lower.includes('consumer') || lower.includes('rajesh')) matchedUser = DEMO_USERS.CONSUMER;

      localStorage.setItem('urja_auth_token', 'mock-demo-jwt-token-urja-sync');
      localStorage.setItem('urja_user', JSON.stringify(matchedUser));

      set({
        user: matchedUser,
        token: 'mock-demo-jwt-token-urja-sync',
        isAuthenticated: true,
      });

      return true;
    },

    loginAsRole: (role: UserRole) => {
      const selectedUser = DEMO_USERS[role];
      localStorage.setItem('urja_auth_token', `demo-${role.toLowerCase()}-token`);
      localStorage.setItem('urja_user', JSON.stringify(selectedUser));
      set({
        user: selectedUser,
        token: `demo-${role.toLowerCase()}-token`,
        isAuthenticated: true,
      });
    },

    logout: () => {
      localStorage.removeItem('urja_auth_token');
      localStorage.removeItem('urja_user');
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (fields: Partial<User>) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, ...fields };
        localStorage.setItem('urja_user', JSON.stringify(updated));
        return { user: updated };
      });
    },
  };
});
