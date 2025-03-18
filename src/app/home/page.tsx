'use client';
import Sidebar from '@/components/SideBar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();
  useEffect(() => {
    const token =
      typeof window !== 'undefined' &&
      (localStorage.getItem('pharmatechToken') ||
        sessionStorage.getItem('pharmatechToken'));

    if (!token) {
      router.push('/login');
    }
  }, [router]);
  return (
    <div className="flex h-screen">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        <h1 className="mb-4 text-2xl font-bold">Welcome to PharmaTech</h1>
        <p className="text-gray-700">
          This is the main content area. Customize it as needed.
        </p>
      </main>
    </div>
  );
};

export default HomePage;
