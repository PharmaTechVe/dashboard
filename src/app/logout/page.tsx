'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
    router.push('/login');
  }, [logout, router]);
  return <h1 className="p-4 text-lg">Cerrando sesión...</h1>;
}
