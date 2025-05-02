'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { CouponResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/Badge';
import { toast } from 'react-toastify';

export default function CouponsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CouponResponse[]>([]);
  const [filtered, setFiltered] = useState<CouponResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const calcStatus = (exp: string | Date): 'Activa' | 'Finalizada' => {
    const today = new Date();
    const e = exp instanceof Date ? exp : new Date(exp);
    today.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    return e >= today ? 'Activa' : 'Finalizada';
  };

  const formatDate = (input: string | Date) => {
    const d = typeof input === 'string' ? new Date(input) : input;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
      const resp = await api.coupon.findAll({ page, limit }, token);
      setItems(resp.results);
      setTotal(resp.count);
    } catch {
      toast.error('Error al cargar cupones');
    }
  }, [page, limit, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    // intentamos parsear como rango de fechas "YYYY-MM-DD,YYYY-MM-DD"
    const parts = query.split(',').map((s) => s.trim());
    if (parts.length === 2) {
      const [startStr, endStr] = parts;
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        setFiltered(
          items.filter((c) => {
            const d = new Date(c.expirationDate);
            d.setHours(0, 0, 0, 0);
            return d >= start && d <= end;
          }),
        );
        return;
      }
    }

    // si no es rango válido, filtramos por código
    setFiltered(
      query ? items.filter((c) => c.code.toLowerCase().includes(query)) : items,
    );
  }, [items, query]);

  const totalPages = Math.ceil(total / limit);

  const columns: Column<CouponResponse>[] = [
    { key: 'code', label: 'Código', render: (c) => c.code },
    { key: 'discount', label: '% Dcto', render: (c) => `${c.discount}%` },
    {
      key: 'minPurchase',
      label: 'Compra min.',
      render: (c) => `$${c.minPurchase.toFixed(2)}`,
    },
    { key: 'maxUses', label: 'Máx usos', render: (c) => c.maxUses },
    {
      key: 'expirationDate',
      label: 'Fecha fin',
      render: (c) => formatDate(c.expirationDate),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (c) => {
        const status = calcStatus(c.expirationDate);
        return (
          <Badge
            variant="filled"
            color={status === 'Activa' ? 'success' : 'info'}
            size="small"
            borderRadius="rounded"
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
      <TableContainer<CouponResponse>
        title="Cupones"
        onSearch={onSearch}
        onAddClick={() => router.push('/coupons/new')}
        addButtonText="Agregar Cupón"
        tableData={filtered}
        tableColumns={columns}
        onView={(c) => router.push(`/coupons/${c.code}`)}
        onEdit={(c) => router.push(`/coupons/${c.code}/edit`)}
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
