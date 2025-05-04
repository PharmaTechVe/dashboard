'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import {
  Pagination,
  GenericProductResponse,
  CategoryResponse,
} from '@pharmatech/sdk';

export default function GenericProductListPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [products, setProducts] = useState<GenericProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, DEBOUNCE_MS);
  };

  const handleCategoryChange = (label: string) => {
    const cat = categories.find((c) => c.name === label);
    setSelectedCategoryId(cat?.id ?? '');
    setCurrentPage(1);
  };

  const fetchProducts = useCallback(
    async (page: number, limit: number, q: string, categoryId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Parameters<typeof api.genericProduct.findAll>[0] = {
          page,
          limit,
          ...(q ? { q } : {}),
          ...(categoryId ? { categoryId } : {}),
        };
        const response: Pagination<GenericProductResponse> =
          await api.genericProduct.findAll(params);
        setProducts(response.results);
        setTotalItems(response.count);
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        setError('No se pudieron cargar los productos.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const resp = await api.category.findAll({ page: 1, limit: 100 });
      setCategories(resp.results);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    if (token && user?.sub) fetchCategories();
  }, [fetchCategories, token, user]);

  useEffect(() => {
    if (token && user?.sub) {
      fetchProducts(currentPage, itemsPerPage, searchQuery, selectedCategoryId);
    }
  }, [
    fetchProducts,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedCategoryId,
    token,
    user,
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (p: GenericProductResponse) => p.name,
    },
    {
      key: 'genericName',
      label: 'Nombre genérico',
      render: (p: GenericProductResponse) => p.genericName,
    },
    {
      key: 'manufacturer',
      label: 'Marca',
      render: (p: GenericProductResponse) => p.manufacturer.name,
    },
    {
      key: 'priority',
      label: 'Prioridad',
      render: (p: GenericProductResponse) => p.priority,
    },
  ];

  const categoryOptions = ['Todas', ...categories.map((c) => c.name)];

  return (
    <div className="mx-auto my-12">
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}
      <TableContainer
        title="Productos Genéricos"
        addButtonText="Agregar Producto"
        onAddClick={() => router.push('/products/new')}
        onSearch={handleSearch}
        dropdownComponent={
          <Dropdown
            title="Categorías"
            items={categoryOptions}
            onChange={handleCategoryChange}
          />
        }
        tableData={products}
        tableColumns={columns}
        onView={(p) => router.push(`/products/${p.id}`)}
        onEdit={(p) => router.push(`/products/${p.id}/edit`)}
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
        <div className="mt-4 text-center">Cargando productos...</div>
      )}
    </div>
  );
}
