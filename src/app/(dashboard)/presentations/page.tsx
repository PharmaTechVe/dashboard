'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { PresentationResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';

export default function PresentationListPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<PresentationResponse[]>([]);
  const [filtered, setFiltered] = useState<PresentationResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const onSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(q.trim().toLowerCase());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const fetchAll = useCallback(async () => {
    try {
      const resp = await api.presentation.findAll({ page, limit });
      setData(resp.results);
      setTotal(resp.count);
    } catch {
      // manejar error si se desea
    }
  }, [page, limit]);

  useEffect(() => {
    if (!user?.sub) return;
    fetchAll();
  }, [fetchAll, user]);

  useEffect(() => {
    const ql = query;
    setFiltered(
      ql
        ? data.filter(
            (p) =>
              p.name.toLowerCase().includes(ql) ||
              p.description.toLowerCase().includes(ql),
          )
        : data,
    );
  }, [data, query]);

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
      <TableContainer<PresentationResponse>
        title="Presentaciones"
        onSearch={onSearch}
        onAddClick={() => router.push('/presentations/new')}
        addButtonText="Agregar presentación"
        tableData={filtered}
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
    </div>
  );
}
