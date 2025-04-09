'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { api } from '@/lib/sdkConfig';

export interface JwtPayload {
  sub: string;
  exp?: number;
}

interface User {
  id: string;
  sub: string; // compatibilidad con lógica que usa user.sub
  name: string;
  email: string;
  role: string;
  isValidated: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: async () => {},
  logout: () => {},
});

const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn('Token expirado');
      return null;
    }
    return decoded;
  } catch (err) {
    console.error('Error al decodificar token:', err);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('pharmatechToken');
    sessionStorage.removeItem('pharmatechToken');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const getProfileFromToken = async (token: string): Promise<User | null> => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    try {
      const profile = await api.user.getProfile(decoded.sub, token);

      if (profile.role?.toLowerCase() !== 'admin') {
        toast.error('Acceso denegado: no tienes permisos de administrador');
        return null;
      }

      return {
        id: profile.id,
        sub: decoded.sub,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        role: profile.role,
        isValidated: profile.isValidated ?? false,
      };
    } catch (error) {
      console.error('Error al obtener perfil del usuario:', error);
      return null;
    }
  };

  const login = async (newToken: string, remember: boolean) => {
    const profile = await getProfileFromToken(newToken);
    if (!profile) {
      logout();
      return;
    }

    sessionStorage.setItem('pharmatechToken', newToken);
    if (remember) {
      localStorage.setItem('pharmatechToken', newToken);
    }

    setToken(newToken);
    setUser(profile);
    toast.success('Inicio de sesión exitoso');
    router.push('/products');
  };

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');

      if (!storedToken) return;

      const profile = await getProfileFromToken(storedToken);
      if (!profile) {
        logout();
        return;
      }

      setToken(storedToken);
      setUser(profile);
    };

    restoreSession();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
