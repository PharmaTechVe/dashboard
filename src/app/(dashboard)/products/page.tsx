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
import { toast } from 'react-toastify';

export default function GenericProductListPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  // datos
  const [products, setProducts] = useState<GenericProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // estados UI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;
  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, DEBOUNCE_MS);
  };

  // dropdown de categorías
  const categoryOptions = ['Todas', ...categories.map((c) => c.name)];
  const handleCategoryChange = (label: string) => {
    const cat = categories.find((c) => c.name === label);
    setSelectedCategoryId(cat?.id ?? '');
    setCurrentPage(1);
  };

  // carga categorías (solo una vez)
  const fetchCategories = useCallback(async () => {
    try {
      const resp = await api.category.findAll({ page: 1, limit: 100 });
      setCategories(resp.results);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      toast.error('No se pudieron cargar las categorías');
    }
  }, []);

  useEffect(() => {
    if (token && user?.sub) fetchCategories();
  }, [fetchCategories, token, user?.sub]);

  // carga productos según filtros — ahora con dependencias correctas
  const fetchProducts = useCallback(async () => {
    if (!token || !user?.sub) return;
    setIsLoading(true);
    setError(null);

    const params: Parameters<typeof api.genericProduct.findAll>[0] = {
      page: currentPage,
      limit: itemsPerPage,
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
    };

    try {
      const response: Pagination<GenericProductResponse> =
        await api.genericProduct.findAll(params);
      setProducts(response.results);
      setTotalItems(response.count);
    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      toast.error('Error al cargar los productos');
      setError('No se pudieron cargar los productos.');
    } finally {
      setIsLoading(false);
    }
  }, [
    token,
    user?.sub,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedCategoryId,
  ]);

  // disparamos la carga de productos cuando cambian filtros/página
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  return (
    <div className="mx-auto my-12">
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      <TableContainer<GenericProductResponse>
        title="Productos Genéricos"
        onAddClick={() => router.push('/products/new')}
        addButtonText="Agregar Producto"
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

      {isLoading && <div className="mt-4 text-center">Cargando productos…</div>}
    </div>
  );
}
