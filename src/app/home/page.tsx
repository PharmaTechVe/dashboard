'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { Colors } from '@/styles/styles';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';

interface ProductResponse {
  results: {
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
  }[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

type ProductItem = {
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
};

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem('pharmatechToken') ||
    localStorage.getItem('pharmatechToken')
  );
};

export default function HomePage() {
  const [productsData, setProductsData] = useState<ProductItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = async (page: number, limit: number) => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('No token found');
        return;
      }
      const response: ProductResponse = await api.product.getProducts({
        page,
        limit,
      });

      const fetchedProducts: ProductItem[] = response.results.map((item) => ({
        id: item.id,
        product: {
          name: item.product.name,
          categories: item.product.categories,
        },
        presentation: {
          name: item.presentation.name,
          quantity: item.presentation.quantity,
        },
        price: item.price,
      }));

      setProductsData(fetchedProducts);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<ProductItem>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item) => item.id.slice(0, 6),
    },
    {
      key: 'productName',
      label: 'Nombre',
      render: (item) => item.product.name,
    },
    {
      key: 'productCategory',
      label: 'Categoría',
      render: (item) => item.product.categories?.[0]?.name || '-',
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
              backgroundColor: isAvailable ? Colors.secondaryLight : '#F08080',
              color: Colors.textMain,
            }}
          >
            {isAvailable ? 'Disponible' : 'Agotado'}
          </span>
        );
      },
    },
  ];

  const handleEdit = (item: ProductItem) => {
    console.log('Editar producto:', item);
  };

  const handleView = (item: ProductItem) => {
    console.log('Ver producto:', item);
  };

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
