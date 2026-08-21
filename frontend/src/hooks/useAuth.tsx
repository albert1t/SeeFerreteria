import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { ApiError, clearToken, setToken, getToken } from '../api/client';
import type { User, UserRole } from '../types';

type Resource = 'pedidos' | 'recambios' | 'familias' | 'tarifas';
type Action = 'create' | 'view' | 'edit' | 'delete' | 'viewDataPage';

type PermissionsMap = Record<Resource, Record<Action, boolean>>;

const ROLE_PERMISSIONS: Record<UserRole, PermissionsMap> = {
  admin: {
    pedidos: { create: true, view: true, edit: true, delete: true, viewDataPage: true },
    recambios: { create: true, view: true, edit: true, delete: true, viewDataPage: true },
    familias: { create: true, view: true, edit: true, delete: true, viewDataPage: true },
    tarifas: { create: true, view: true, edit: true, delete: true, viewDataPage: true },
  },
  operario: {
    pedidos: { create: true, view: true, edit: true, delete: false, viewDataPage: false },
    recambios: { create: false, view: true, edit: false, delete: false, viewDataPage: false },
    familias: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
    tarifas: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
  },
  user: {
    pedidos: { create: true, view: true, edit: true, delete: false, viewDataPage: false },
    recambios: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
    familias: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
    tarifas: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
  },
  viewer: {
    pedidos: { create: false, view: true, edit: false, delete: false, viewDataPage: false },
    recambios: { create: false, view: true, edit: false, delete: false, viewDataPage: false },
    familias: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
    tarifas: { create: false, view: false, edit: false, delete: false, viewDataPage: false },
  },
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, name: string, password: string) => Promise<void>;
  loginMicrosoft: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  can: (resource: Resource, action: Action) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        return null;
      }
      try {
        const { user: u } = await authApi.getMe();
        setUser(u);
        return u;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          setUser(null);
          return null;
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(async (username: string, password: string) => {
    const { user: u, token } = await authApi.login(username, password);
    setToken(token);
    setUser(u);
    queryClient.setQueryData(['auth', 'me'], u);
  }, [queryClient]);

  const register = useCallback(async (username: string, name: string, password: string) => {
    const { user: u, token } = await authApi.register(username, name, password);
    setToken(token);
    setUser(u);
    queryClient.setQueryData(['auth', 'me'], u);
  }, [queryClient]);

  const loginMicrosoft = useCallback(async (idToken: string) => {
    const { user: u, token } = await authApi.loginMicrosoft(idToken);
    setToken(token);
    setUser(u);
    queryClient.setQueryData(['auth', 'me'], u);
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authApi.logout();
    clearToken();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const can = useCallback((resource: Resource, action: Action) => {
    if (!user) return false;
    return Boolean(ROLE_PERMISSIONS[user.role][resource][action]);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      loginMicrosoft,
      logout,
      isAdmin: user?.role === 'admin',
      can,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
