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

  const [items, setItems] = useState<PresentationResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const onSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const fetchPresentations = useCallback(async () => {
    if (!user?.sub) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await api.presentation.findAll({
        page,
        limit,
        ...(query ? { q: query } : {}),
      });
      setItems(resp.results);
      setTotal(resp.count);
    } catch {
      toast.error('Error al cargar presentaciones');
      setError('No se pudieron cargar las presentaciones.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, query, user]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const totalPages = Math.ceil(total / limit);

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
        onSearch={onSearch}
        onAddClick={() => router.push('/presentations/new')}
        addButtonText="Agregar presentación"
        tableData={items}
        tableColumns={columns}
        onView={(p) => router.push(`/presentations/${p.id}`)}
        onEdit={(p) => router.push(`/presentations/${p.id}/edit`)}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          onPageChange: setPage,
          onItemsPerPageChange: (val) => {
            setLimit(val);
            setPage(1);
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
