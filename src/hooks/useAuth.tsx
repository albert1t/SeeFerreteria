import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { ApiError, clearToken, setToken, getToken } from '../api/client';
import type { User } from '../types';

type Resource = 'pedidos' | 'recambios';
type Action = 'create' | 'view' | 'edit' | 'delete';

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
    const perms = user?.permissions;
    if (!perms) return false;
    if (perms.admin) return true;
    return Boolean(perms[resource]?.[action]);
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
