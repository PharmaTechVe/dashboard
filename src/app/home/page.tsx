'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import AdminProductsTable from '@/components/Table';
import { api } from '@/lib/sdkConfig';

interface ProductItem {
  id: string;
  product: {
    name: string;
    categories: { name: string }[];
  };
  presentation: {
    name: string;
    quantity: number;
  };
  price: number;
}

interface PaginationResponse {
  results: ProductItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const [productsData, setProductsData] = useState<PaginationResponse | null>(
    null,
  );

  useEffect(() => {
    const token =
      typeof window !== 'undefined' &&
      (localStorage.getItem('pharmatechToken') ||
        sessionStorage.getItem('pharmatechToken'));

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const data = await api.product.getProducts({ page: 1, limit: 20 });
        setProductsData(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [router]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <h1 className="mb-4 text-2xl font-bold">Bienvenido a PharmaTech</h1>
          {productsData ? (
            <AdminProductsTable products={productsData.results} />
          ) : (
            <p>Cargando productos...</p>
          )}
        </main>
      </div>
    </div>
  );
}
