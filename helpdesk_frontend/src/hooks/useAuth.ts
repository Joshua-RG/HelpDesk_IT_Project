import { useState, useCallback } from 'react';
import { authApi } from '@/services/api';
import type { User, LoginPayload, RegisterPayload } from '@/types';

const TOKEN_KEY = 'helpdesk_token';
const USER_KEY = 'helpdesk_user';

function loadStoredAuth(): { token: string | null; user: User | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  let user: User | null = null;
  if (raw) {
    try { user = JSON.parse(raw); } catch { /* ignore */ }
  }
  return { token, user };
}

export function useAuth() {
  const stored = loadStoredAuth();
  const [token, setToken] = useState<string | null>(stored.token);
  const [user, setUser] = useState<User | null>(stored.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      // Forzamos el tipado con 'any' temporalmente para leer nuestra estructura
      const res = await authApi.login(payload) as any;
      
      // Construimos el usuario con los datos reales del backend
      const loggedUser = { email: res.email, role: res.role, username: res.email };
      persistAuth(res.token, loggedUser);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(payload) as any;
      
      const newUser = { email: res.email, role: res.role, username: res.email };
      persistAuth(res.token, newUser);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
