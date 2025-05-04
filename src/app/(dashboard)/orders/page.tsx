'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { OrderResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/Badge';
import { toast } from 'react-toastify';

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<OrderResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // estados de carga y error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const formatDate = (input: string | Date) =>
    new Date(input).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const onSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await api.order.findAll({ page, limit, q: query }, token);
      setData(resp.results);
      setTotal(resp.count);
    } catch {
      toast.error('Error al cargar órdenes');
      setError('No se pudieron cargar las órdenes.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, query, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalPages = Math.ceil(total / limit);

  const columns: Column<OrderResponse>[] = [
    { key: 'id', label: 'ID', render: (o) => o.id.slice(0, 8) },
    {
      key: 'createdAt',
      label: 'Creación',
      render: (o) => formatDate(o.createdAt),
    },
    {
      key: 'updatedAt',
      label: 'Actualización',
      render: (o) => formatDate(o.updatedAt),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (o) => (
        <Badge
          variant="filled"
          color={
            o.status === 'completed'
              ? 'success'
              : o.status === 'requested'
                ? 'warning'
                : 'info'
          }
          size="small"
          borderRadius="rounded"
        >
          {o.status}
        </Badge>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Precio total',
      render: (o) => `$${o.totalPrice.toFixed(2)}`,
    },
    { key: 'type', label: 'Tipo', render: (o) => o.type },
  ];

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}
      <TableContainer<OrderResponse>
        title="Órdenes"
        onSearch={onSearch}
        onAddClick={() => router.push('/orders/new')}
        addButtonText="Agregar orden"
        tableData={data}
        tableColumns={columns}
        onView={(o) => router.push(`/orders/${o.id}`)}
        onEdit={(o) => router.push(`/orders/${o.id}/edit`)}
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
      {isLoading && <div className="mt-4 text-center">Cargando órdenes...</div>}
    </div>
  );
}
