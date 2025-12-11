import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  phone?: string;
  email?: string;
  fullName?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string, captcha: string) => Promise<void>;
  register: (phone: string, password: string, fullName?: string, captcha?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (phone: string, password: string, captcha: string) => {
    const data = await api.login(phone, password, captcha);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (phone: string, password: string, fullName?: string, captcha?: string) => {
    const data = await api.register(phone, password, fullName, captcha);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

