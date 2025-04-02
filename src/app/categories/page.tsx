'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
//import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  const getToken = () => {
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  useEffect(() => {
    const fetchCategories = async (page: number, limit: number) => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await api.category.findAll({
          page,
          limit,
        });

        const filteredResults = response.results;
        setCategories(filteredResults);
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
        toast.error('Error al cargar las categorías');
      }
    };

    fetchCategories(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<CategoryItem>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (item: CategoryItem) => item.name,
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (item: CategoryItem) =>
        item.description.length > 50
          ? `${item.description.substring(0, 50)}...`
          : item.description,
    },
  ];

  const handleAddCategory = () => {
    router.push('/categories/new');
  };

  const handleViewCategory = (item: CategoryItem) => {
    router.push(`/categories/${item.id}`);
  };

  const handleEditCategory = (item: CategoryItem) => {
    router.push(`/categories/${item.id}/edit`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 150px)' }}
          >
            {}
            <TableContainer
              title="Categorías"
              tableData={categories}
              tableColumns={columns}
              onAddClick={handleAddCategory}
              onEdit={handleEditCategory}
              onView={handleViewCategory}
              addButtonText="Agregar Categoria"
              onSearch={(query) => console.log('Buscando sucursal:', query)}
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
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
