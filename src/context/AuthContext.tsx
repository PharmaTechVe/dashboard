'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  user: JwtPayload | null;
  login: (token: string, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

const decodeToken = (rawToken: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(rawToken);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn('Token expirado');
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken =
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken');

    if (storedToken) {
      setToken(storedToken);
      const decoded = decodeToken(storedToken);
      setUser(decoded);
    }
  }, []);

  useEffect(() => {
    const syncLogout = () => {
      const storedToken = localStorage.getItem('pharmatechToken');
      setToken(storedToken);
      setUser(storedToken ? decodeToken(storedToken) : null);
    };

    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  const login = (newToken: string, remember: boolean) => {
    sessionStorage.setItem('pharmatechToken', newToken);
    if (remember) {
      localStorage.setItem('pharmatechToken', newToken);
    }

    setToken(newToken);
    const decoded = decodeToken(newToken);
    setUser(decoded);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('pharmatechToken');
    sessionStorage.removeItem('pharmatechToken');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
