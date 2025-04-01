'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
//import Button from '@/components/Button';
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
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const getToken = () => {
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  const fetchCategories = async (page: number, limit: number) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.category.findAll({
        page,
        limit,
      });

      let filteredResults = response.results;
      if (searchQuery) {
        filteredResults = response.results.filter(
          (category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        );
      }

      setCategories(filteredResults);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      toast.error('Error al cargar las categorías');
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, searchQuery]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<CategoryItem>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item: CategoryItem) => item.id.slice(0, 3).padStart(3, '0'),
    },
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
    {
      key: 'actions',
      label: 'Acciones',
      render: (item: CategoryItem) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/categories/${item.id}`)}
            className="text-blue-600 hover:text-blue-800"
          >
            Ver
          </button>
          <button
            onClick={() => router.push(`/categories/${item.id}/edit`)}
            className="text-green-600 hover:text-green-800"
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  const handleAddCategory = () => {
    router.push('/categories/new');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto my-12 max-h-[616px] max-w-[949px]">
            <div className="[&>ul]:max-h-60 [&>ul]:overflow-y-auto">
              {}
              <TableContainer<CategoryItem>
                title="Categorías"
                tableData={categories}
                tableColumns={columns}
                onAddClick={handleAddCategory}
                onSearch={handleSearch}
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
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
