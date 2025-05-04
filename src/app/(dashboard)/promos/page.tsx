'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { PromoResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/Badge';
import { toast } from 'react-toastify';

export default function PromosPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<PromoResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const calcStatus = (
    start: string | Date,
    end: string | Date,
  ): 'Activa' | 'Finalizada' => {
    const now = new Date();
    const s = start instanceof Date ? start : new Date(start);
    const e = end instanceof Date ? end : new Date(end);
    return now >= s && now <= e ? 'Activa' : 'Finalizada';
  };

  const onSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const fetchPromos = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await api.promo.findAll(
        { page, limit, ...(query ? { q: query } : {}) },
        token,
      );
      setItems(resp.results);
      setTotal(resp.count);
    } catch {
      toast.error('Error al cargar promociones');
      setError('No se pudieron cargar las promociones.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, query, token]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const totalPages = Math.ceil(total / limit);

  const columns: Column<PromoResponse>[] = [
    { key: 'name', label: 'Nombre', render: (p) => p.name },
    { key: 'discount', label: '% Dcto', render: (p) => `${p.discount}%` },
    {
      key: 'startAt',
      label: 'Inicio',
      render: (p) => new Date(p.startAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'expiredAt',
      label: 'Fin',
      render: (p) => new Date(p.expiredAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (p) => (
        <Badge
          variant="filled"
          color={
            calcStatus(p.startAt, p.expiredAt) === 'Activa'
              ? 'success'
              : 'danger'
          }
          size="medium"
          borderRadius="square"
        >
          {calcStatus(p.startAt, p.expiredAt)}
        </Badge>
      ),
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
      <TableContainer<PromoResponse>
        title="Promociones"
        onSearch={onSearch}
        onAddClick={() => router.push('/promos/new')}
        addButtonText="Agregar Promo"
        tableData={items}
        tableColumns={columns}
        onView={(p) => router.push(`/promos/${p.id}`)}
        onEdit={(p) => router.push(`/promos/${p.id}/edit`)}
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
        <div className="mt-4 text-center">Cargando promociones...</div>
      )}
    </div>
  );
}
