'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'PUBLIC' | 'ADMIN' | 'SUPER_ADMIN';
  department: string | null;
  region: string | null;
  avatar?: string;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: (role: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  isPublic: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for frontend-only mode
const demoUsers: Record<string, UserData> = {
  PUBLIC: { id: 'demo-pub-1', name: 'Aarav Citizen', email: 'citizen@demo.com', role: 'PUBLIC', department: null, region: 'Delhi' },
  ADMIN: { id: 'demo-adm-1', name: 'Rajesh Kumar', email: 'admin@trafficpolice.gov.in', role: 'ADMIN', department: 'Delhi Traffic Police', region: 'Delhi-Central' },
  SUPER_ADMIN: { id: 'demo-sa-1', name: 'Commissioner Singh', email: 'superadmin@delhi.gov.in', role: 'SUPER_ADMIN', department: null, region: 'Delhi-NCR' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('grievance_token');
    const savedUser = localStorage.getItem('grievance_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (tkn: string, usr: UserData) => {
    setToken(tkn);
    setUser(usr);
    localStorage.setItem('grievance_token', tkn);
    localStorage.setItem('grievance_user', JSON.stringify(usr));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.data.token, data.data.user);
        return true;
      }
    } catch {
      // Backend unavailable — try demo match
      const found = Object.values(demoUsers).find((u) => u.email === email);
      if (found) {
        saveSession('demo-token-' + found.role, found);
        return true;
      }
    }
    return false;
  };

  const demoLogin = async (role: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.data.token, data.data.user);
        return true;
      }
    } catch {
      // Frontend-only fallback
      const usr = demoUsers[role];
      if (usr) {
        saveSession('demo-token-' + role, usr);
        return true;
      }
    }
    return false;
  };

  const register = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.data.token, data.data.user);
        return true;
      }
    } catch {
      // Frontend-only
      const usr: UserData = {
        id: 'demo-' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: 'PUBLIC',
        department: null,
        region: 'Delhi',
      };
      saveSession('demo-token-PUBLIC', usr);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('grievance_token');
    localStorage.removeItem('grievance_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        isPublic: user?.role === 'PUBLIC',
        isAdmin: user?.role === 'ADMIN',
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
