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
  const [filtered, setFiltered] = useState<PromoResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

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
      setQuery(q.trim().toLowerCase());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const resp = await api.promo.findAll({ page, limit }, token);
      setItems(resp.results);
      setTotal(resp.count);
    } catch {
      toast.error('Error al cargar promociones');
    }
  }, [page, limit, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const parts = query.split(',').map((s) => s.trim());
    if (parts.length === 2) {
      const [startStr, endStr] = parts;
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        setFiltered(
          items.filter((p) => {
            const s = new Date(p.startAt);
            const e = new Date(p.expiredAt);
            return (s >= start && s <= end) || (e >= start && e <= end);
          }),
        );
        return;
      }
    }

    setFiltered(
      query ? items.filter((p) => p.name.toLowerCase().includes(query)) : items,
    );
  }, [items, query]);

  useEffect(() => {
    const iv = setInterval(fetchAll, 60000);
    return () => clearInterval(iv);
  }, [fetchAll]);

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
      render: (p) => {
        const status = calcStatus(p.startAt, p.expiredAt);
        return (
          <Badge
            variant="filled"
            color={status === 'Activa' ? 'success' : 'danger'}
            size="medium"
            borderRadius="square"
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      <TableContainer<PromoResponse>
        title="Promociones"
        onSearch={onSearch}
        onAddClick={() => router.push('/promos/new')}
        addButtonText="Agregar Promo"
        tableData={filtered}
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
    </div>
  );
}
