'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { Colors } from '@/styles/styles';
import Dropdown from '@/components/Dropdown';

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
    {
      id: '004',
      product: {
        name: 'Loratadina',
        categories: [{ name: 'Antihistamínico' }],
      },
      presentation: { name: 'Tabletas', quantity: 10 },
      price: 3.5,
    },
    {
      id: '005',
      product: { name: 'Amoxicilina', categories: [{ name: 'Antibiótico' }] },
      presentation: { name: 'Cápsulas', quantity: 0 },
      price: 15.99,
    },
    {
      id: '006',
      product: { name: 'Metformina', categories: [{ name: 'Antidiabético' }] },
      presentation: { name: 'Tabletas', quantity: 45 },
      price: 12.75,
    },
    {
      id: '007',
      product: {
        name: 'Salbutamol',
        categories: [{ name: 'Broncodilatador' }],
      },
      presentation: { name: 'Inhalador', quantity: 5 },
      price: 25.0,
    },
    {
      id: '008',
      product: {
        name: 'Ranitidina',
        categories: [{ name: 'Gastrointestinal' }],
      },
      presentation: { name: 'Tabletas', quantity: 12 },
      price: 9.99,
    },
  ]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const totalPages = Math.ceil(productsData.length / itemsPerPage);

  // Columnas para la tabla
  const columns: Column<ProductItem>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item) => item.id,
    },
    {
      key: 'productName',
      label: 'Nombre',
      render: (item) => item.product.name,
    },
    {
      key: 'productCategory',
      label: 'Categoría',
      render: (item) => item.product.categories[0]?.name || '-',
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => `$${item.price.toFixed(2)}`,
    },
    {
      key: 'stockQty',
      label: 'Stock',
      render: (item) => item.presentation.quantity,
    },
    {
      key: 'stockStatus',
      label: 'Status',
      render: (item) => {
        const isAvailable = item.presentation.quantity > 0;
        return (
          <span
            className="items-center justify-center rounded-md px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: Colors.secondaryLight,
              color: Colors.textMain,
            }}
          >
            {isAvailable ? 'Disponible' : 'Agotado'}
          </span>
        );
      },
    },
  ];

  // Acciones de edición / vista
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <h1 className="mb-4 text-2xl font-bold">Bienvenido a PharmaTech</h1>

          <TableContainer
            title="Productos"
            dropdownComponent={
              <Dropdown
                title="Categoría"
                items={[
                  'Todos',
                  'Antibiótico',
                  'Analgésico',
                  'Gastrointestinal',
                ]}
                onChange={(val) => console.log('Filtrar por:', val)}
              />
            }
            onAddClick={() => console.log('Agregar nuevo producto')}
            onSearch={(query) => console.log('Buscando:', query)}
            tableData={productsData}
            tableColumns={columns}
            onEdit={handleEdit}
            onView={handleView}
            pagination={{
              currentPage,
              totalPages,
              itemsPerPage,
              onPageChange: (page) => setCurrentPage(page),
              onItemsPerPageChange: (val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              },
              itemsPerPageOptions: [3, 5, 10, 15, 20],
            }}
          />
        </main>
      </div>
    </div>
  );
}
