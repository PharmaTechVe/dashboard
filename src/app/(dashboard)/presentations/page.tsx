'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { PresentationResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function PresentationListPage() {
  const { user } = useAuth();
  const router = useRouter();

  // datos y paginación
  const [presentations, setPresentations] = useState<PresentationResponse[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // estados de carga y error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // debounce
  const DEBOUNCE_MS = 500;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, DEBOUNCE_MS);
  };

  // fetch presentaciones usando solo filtros soportados por el backend (q)
  const fetchPresentations = useCallback(async () => {
    if (!user?.sub) return;
    setIsLoading(true);
    setError(null);
    const params: Parameters<typeof api.presentation.findAll>[0] = {
      page: currentPage,
      limit: itemsPerPage,
      ...(searchQuery ? { q: searchQuery } : {}),
    };
    try {
      const response = await api.presentation.findAll(params);
      setPresentations(response.results);
      setTotalItems(response.count);
    } catch (err: unknown) {
      console.error('Error fetching presentations:', err);
      toast.error('Error al cargar presentaciones');
      setError('No se pudieron cargar las presentaciones.');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<PresentationResponse>[] = [
    { key: 'name', label: 'Presentación', render: (p) => p.name },
    { key: 'description', label: 'Descripción', render: (p) => p.description },
    { key: 'quantity', label: 'Cantidad', render: (p) => p.quantity },
    {
      key: 'measurementUnit',
      label: 'Unidad',
      render: (p) => p.measurementUnit,
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

      <TableContainer<PresentationResponse>
        title="Presentaciones"
        onSearch={handleSearch}
        onAddClick={() => router.push('/presentations/new')}
        addButtonText="Agregar presentación"
        tableData={presentations}
        tableColumns={columns}
        onView={(p) => router.push(`/presentations/${p.id}`)}
        onEdit={(p) => router.push(`/presentations/${p.id}/edit`)}
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
        <div className="mt-4 text-center">Cargando presentaciones...</div>
      )}
    </div>
  );
}
