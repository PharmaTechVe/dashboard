'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { CategoryResponse } from '@pharmatech/sdk/types';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<
    CategoryResponse[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchCategories = useCallback(
    async (page: number, limit: number) => {
      try {
        if (!token) return;

        const response = await api.category.findAll({ page, limit });
        setCategories(response.results);
        setFilteredCategories(response.results);
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
        toast.error('Error al cargar las categorías');
      } finally {
        setLoadingData(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token || !user?.sub) return;
    fetchCategories(currentPage, itemsPerPage);
  }, [fetchCategories, currentPage, itemsPerPage, token, user]);

  useEffect(() => {
    const filtered = searchQuery
      ? categories.filter(
          (category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        )
      : categories;

    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<CategoryResponse>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (item: CategoryResponse) => item.name,
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (item: CategoryResponse) =>
        item.description.length > 50
          ? `${item.description.substring(0, 50)}...`
          : item.description,
    },
  ];

  const handleAddCategory = () => {
    router.push('/categories/new');
  };

  const handleViewCategory = (item: CategoryResponse) => {
    router.push(`/categories/${item.id}`);
  };

  const handleEditCategory = (item: CategoryResponse) => {
    router.push(`/categories/${item.id}/edit`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  if (loading || !token || !user?.sub || loadingData) {
    return <h1 className="p-4 text-lg">Cargando categorías...</h1>;
  }

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      <TableContainer
        title="Categorías"
        tableData={filteredCategories} // Usa los datos filtrados
        tableColumns={columns}
        onAddClick={handleAddCategory}
        onEdit={handleEditCategory}
        onView={handleViewCategory}
        addButtonText="Agregar Categoria"
        onSearch={handleSearch} // Añadida la función de búsqueda
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
  );
}
