'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Table, { Column } from '@/components/Table';

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

export default function HomePage() {
  const router = useRouter();
  const [productsData] = useState<ProductItem[]>([
    {
      id: '001',
      product: { name: 'Paracetamol', categories: [{ name: 'Analgésico' }] },
      presentation: { name: 'Tabletas', quantity: 50 },
      price: 5.99,
    },
    {
      id: '002',
      product: {
        name: 'Ibuprofeno',
        categories: [{ name: 'Antiinflamatorio' }],
      },
      presentation: { name: 'Cápsulas', quantity: 30 },
      price: 7.49,
    },
    {
      id: '003',
      product: {
        name: 'Omeprazol',
        categories: [{ name: 'Gastrointestinal' }],
      },
      presentation: { name: 'Cápsulas', quantity: 20 },
      price: 10.99,
    },
  ]);

  const columns: Column<ProductItem>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item) => item.id,
    },
    {
      key: 'product',
      label: 'Nombre',
      render: (item) => item.product.name,
    },
    {
      key: 'product',
      label: 'Categoría',
      render: (item) => item.product.categories[0]?.name || '-',
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => `$${item.price.toFixed(2)}`,
    },
    {
      key: 'presentation',
      label: 'Stock',
      render: (item) => item.presentation.quantity,
    },
    {
      key: 'presentation',
      label: 'Status',
      render: (item) =>
        item.presentation.quantity > 0 ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Disponible
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Agotado
          </span>
        ),
    },
  ];

  const handleEdit = (item: ProductItem) => {
    console.log('Editar producto:', item);
  };

  const handleView = (item: ProductItem) => {
    console.log('Ver producto:', item);
  };

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
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <h1 className="mb-4 text-2xl font-bold">Bienvenido a PharmaTech</h1>
          <Table
            data={productsData}
            columns={columns}
            title="Productos"
            description="Lista de productos disponibles"
            customColors={{
              headerBg: 'bg-[#1C2143]',
              headerText: 'text-white',
              rowBorder: 'border-gray-200',
            }}
            onEdit={handleEdit}
            onView={handleView}
          />
        </main>
      </div>
    </div>
  );
}
