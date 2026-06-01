'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hora en ms
const LAST_ACTIVE_KEY = 'ot_last_active';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  address?: string | null;
  province?: string | null;
  city?: string | null;
  birthDate?: string | null;
  citizenship?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const noop = () => undefined;

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  loginUser: noop,
  updateUser: noop,
  logout: noop,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('ot_token');
    const savedUser = localStorage.getItem('ot_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const loginUser = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ot_token', newToken);
    localStorage.setItem('ot_user', JSON.stringify(newUser));
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('ot_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ot_token');
    localStorage.removeItem('ot_user');
    localStorage.removeItem(LAST_ACTIVE_KEY);
  };

  const logoutInactive = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ot_token');
    localStorage.removeItem('ot_user');
    localStorage.removeItem(LAST_ACTIVE_KEY);
    window.location.href = '/login?expired=1';
  }, []);

  useEffect(() => {
    if (!token) return;

    const resetTimer = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logoutInactive, IDLE_TIMEOUT);
    };

    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
    if (lastActive && Date.now() - lastActive > IDLE_TIMEOUT) {
      logoutInactive();
      return;
    }

    const remaining = lastActive ? IDLE_TIMEOUT - (Date.now() - lastActive) : IDLE_TIMEOUT;
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    timerRef.current = setTimeout(logoutInactive, remaining);

    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, logoutInactive]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
