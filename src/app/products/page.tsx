'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import { useRouter } from 'next/navigation';

interface Manufacturer {
  id: string;
  name: string;
  description: string;
  country: { name: string };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export interface GenericProductResponse {
  id: string;
  name: string;
  genericName: string;
  description?: string;
  priority: number;
  manufacturer: Manufacturer;
  categories: Category[];
}

type GenericProductItem = GenericProductResponse;

export default function GenericProductListPage() {
  const [products, setProducts] = useState<GenericProductItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  const fetchProducts = async (page: number, limit: number) => {
    try {
      const response = await api.genericProduct.findAll({ page, limit });
      setProducts(response.results);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error fetching generic products:', error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<GenericProductItem>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (item) => item.name,
    },
    {
      key: 'genericName',
      label: 'Nombre genérico',
      render: (item) => item.genericName,
    },
    {
      key: 'manufacturer',
      label: 'Marca',
      render: (item) => item.manufacturer.name,
    },
    {
      key: 'priority',
      label: 'Prioridad',
      render: (item) => item.priority,
    },
  ];

  const handleEdit = (item: GenericProductItem) => {
    router.push(`/products/${item.id}/edit`);
  };

  const handleView = (item: GenericProductItem) => {
    router.push(`/products/${item.id}`);
  };

  const handleAdd = () => {
    router.push(`/products/new`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <h1 className="mb-4 text-2xl font-bold">Productos genéricos</h1>
          <TableContainer
            title="Productos genéricos"
            dropdownComponent={
              <Dropdown
                title="Categorias"
                items={['All']}
                onChange={(val) => console.log('Filter by:', val)}
              />
            }
            onAddClick={handleAdd}
            onSearch={(query) => console.log('Searching:', query)}
            tableData={products}
            tableColumns={columns}
            onEdit={handleEdit}
            onView={handleView}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage,
              onPageChange: (page) => setCurrentPage(page),
              onItemsPerPageChange: (val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              },
              itemsPerPageOptions: [5, 10, 15, 20],
            }}
          />
        </main>
      </div>
    </div>
  );
}
