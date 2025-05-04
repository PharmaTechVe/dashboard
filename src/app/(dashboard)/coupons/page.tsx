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

  // datos y paginación
  const [items, setItems] = useState<CouponResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const calcStatus = (exp: string | Date): 'Activa' | 'Finalizada' => {
    const today = new Date();
    const e = exp instanceof Date ? exp : new Date(exp);
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
      setQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const fetchCoupons = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await api.coupon.findAll(
        { page, limit, ...(query ? { q: query } : {}) },
        token,
      );
      setItems(resp.results);
      setTotal(resp.count);
    } catch {
      toast.error('Error al cargar cupones');
      setError('No se pudieron cargar los cupones.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, query, token]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

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
      render: (c) => (
        <Badge
          variant="filled"
          color={calcStatus(c.expirationDate) === 'Activa' ? 'success' : 'info'}
          size="small"
          borderRadius="rounded"
        >
          {calcStatus(c.expirationDate)}
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
      <TableContainer<CouponResponse>
        title="Cupones"
        onSearch={onSearch}
        onAddClick={() => router.push('/coupons/new')}
        addButtonText="Agregar Cupón"
        tableData={items}
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
      {isLoading && <div className="mt-4 text-center">Cargando cupones...</div>}
    </div>
  );
}
