'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import { Pagination, CategoryResponse } from '@pharmatech/sdk';
import { toast } from 'react-toastify';

export default function CategoriesPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  // Estados
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce para búsqueda
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;
  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, DEBOUNCE_MS);
  };

  // Fetch que llama al backend con q, page y limit
  const fetchCategories = useCallback(async () => {
    if (!token || !user?.sub) return;
    setIsLoading(true);
    setError(null);

    const params: Parameters<typeof api.category.findAll>[0] = {
      page: currentPage,
      limit: itemsPerPage,
      ...(searchQuery ? { q: searchQuery } : {}),
    };

    try {
      const response: Pagination<CategoryResponse> =
        await api.category.findAll(params);
      setCategories(response.results);
      setTotalItems(response.count);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      toast.error('Error al cargar categorías');
      setError('No se pudieron cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.sub, currentPage, itemsPerPage, searchQuery]);

  // Disparo inicial y cuando cambian filtros/paginación
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Columnas tipadas
  const columns: Column<CategoryResponse>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (c: CategoryResponse) => c.name,
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (c: CategoryResponse) =>
        c.description.length > 50
          ? `${c.description.slice(0, 50)}…`
          : c.description,
    },
  ];

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      <TableContainer<CategoryResponse>
        title="Categorías"
        onSearch={handleSearch}
        onAddClick={() => router.push('/categories/new')}
        addButtonText="Agregar Categoría"
        tableData={categories}
        tableColumns={columns}
        onView={(c) => router.push(`/categories/${c.id}`)}
        onEdit={(c) => router.push(`/categories/${c.id}/edit`)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          },
          itemsPerPageOptions: [5, 10, 15, 20],
        }}
      />

      {isLoading && (
        <div className="mt-4 text-center">Cargando categorías...</div>
      )}
    </div>
  );
}
