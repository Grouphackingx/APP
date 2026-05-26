'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizerProfile?: { status: string; organizationLogo?: string; id?: string };
  isMember?: boolean;
  memberRole?: 'ADMIN' | 'STAFF';
  organizerProfileId?: string;
  impersonatedBy?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isImpersonating: boolean;
  loginUser: (token: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isImpersonating: false,
  loginUser: () => { /* noop */ },
  updateUser: () => { /* noop */ },
  logout: () => { /* noop */ },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ot_host_token');
    const savedUser = localStorage.getItem('ot_host_user');
    if (savedToken && savedUser && savedUser !== 'undefined') {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ot_host_token');
        localStorage.removeItem('ot_host_user');
      }
    } else {
      localStorage.removeItem('ot_host_token');
      localStorage.removeItem('ot_host_user');
    }
    setIsLoading(false);
  }, []);

  const loginUser = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ot_host_token', newToken);
    localStorage.setItem('ot_host_user', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('ot_host_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ot_host_token');
    localStorage.removeItem('ot_host_user');
    window.location.href = '/login';
  };

  const isImpersonating = !!user?.impersonatedBy;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isImpersonating, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
