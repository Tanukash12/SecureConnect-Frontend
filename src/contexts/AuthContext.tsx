import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';
import { socketClient } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      loadProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadProfile = async (token: string) => {
    const { data, error } = await api.getProfile();
    if (data && !error) {
      setUser(data);
      socketClient.connect(token);
    } else {
      api.setToken(null);
    }
    setIsLoading(false);
  };

  const login = async (username: string, password: string) => {
    const { data, error } = await api.login(username, password);
    if (data && !error) {
      api.setToken(data.token);
      setUser(data.user);
      socketClient.connect(data.token);
      return { success: true };
    }
    return { success: false, error };
  };

  const logout = () => {
    const token = api.getToken();
    if (token) {
      socketClient.disconnect(token);
    }
    api.setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await api.getProfile();
    if (data) {
      setUser(data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshProfile,
      }}
    >
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
