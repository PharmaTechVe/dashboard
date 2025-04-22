'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/SideBar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const tokenChecked = useRef(false);

  useEffect(() => {
    if (!loading && (!token || !user?.sub)) {
      if (!tokenChecked.current) {
        router.replace('/login');
        tokenChecked.current = true;
      }
    }
  }, [token, user, loading, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex h-full flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[#F1F5FD] p-6 text-[#393938]">
          {children}
        </main>
      </div>
    </div>
  );
}
