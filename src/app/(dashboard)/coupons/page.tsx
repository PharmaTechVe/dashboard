'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import { Pagination, CouponResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/Badge';

// Presets de rango de expiración que el backend soporta via expirationBetween
const expirationTranslations: Record<string, string> = {
  '': 'Todos',
  '7': 'Próximos 7 días',
  '30': 'Próximos 30 días',
  '90': 'Próximos 90 días',
};
const expirationOptions = Object.entries(expirationTranslations).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

export default function CouponsPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExpirationPeriod, setSelectedExpirationPeriod] =
    useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = (q: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, 500);
  };

  const handlePeriodChange = (label: string) => {
    const opt = expirationOptions.find((o) => o.label === label);
    setSelectedExpirationPeriod(opt?.value ?? '');
    setCurrentPage(1);
  };

  const fetchCoupons = useCallback(
    async (page: number, limit: number, q: string, period: string) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      const params: Parameters<typeof api.coupon.findAll>[0] = {
        page,
        limit,
        ...(q ? { q } : {}),
      };

      if (period) {
        const days = parseInt(period, 10);
        const start = new Date();
        const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
        params.expirationBetween = { start, end };
      }

      try {
        const response: Pagination<CouponResponse> = await api.coupon.findAll(
          params,
          token,
        );
        setCoupons(response.results);
        setTotalItems(response.count);
      } catch (err: unknown) {
        console.error('Error fetching coupons:', err);
        setError('No se pudieron cargar los cupones.');
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchCoupons(
      currentPage,
      itemsPerPage,
      searchQuery,
      selectedExpirationPeriod,
    );
  }, [
    fetchCoupons,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedExpirationPeriod,
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // columnas tipadas
  const columns: Column<CouponResponse>[] = [
    {
      key: 'code',
      label: 'Código',
      render: (c: CouponResponse) => c.code,
    },
    {
      key: 'discount',
      label: '% Dcto',
      render: (c: CouponResponse) => `${c.discount}%`,
    },
    {
      key: 'minPurchase',
      label: 'Compra min.',
      render: (c: CouponResponse) => `$${c.minPurchase.toFixed(2)}`,
    },
    {
      key: 'maxUses',
      label: 'Máx usos',
      render: (c: CouponResponse) => c.maxUses,
    },
    {
      key: 'expirationDate',
      label: 'Fecha fin',
      render: (c: CouponResponse) =>
        new Date(c.expirationDate).toLocaleDateString('es-ES'),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (c: CouponResponse) => {
        const isActive = new Date(c.expirationDate) >= new Date();
        return (
          <Badge
            variant="filled"
            color={isActive ? 'success' : 'info'}
            size="small"
          >
            {isActive ? 'Activa' : 'Finalizada'}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="mx-auto my-12">
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      <TableContainer<CouponResponse>
        title="Cupones"
        onAddClick={() => router.push('/coupons/new')}
        addButtonText="Agregar Cupón"
        onSearch={handleSearch}
        dropdownComponent={
          <Dropdown
            title="Expira en"
            items={expirationOptions.map((o) => o.label)}
            onChange={handlePeriodChange}
          />
        }
        tableData={coupons}
        tableColumns={columns}
        onView={(c) => router.push(`/coupons/${c.code}`)}
        onEdit={(c) => router.push(`/coupons/${c.code}/edit`)}
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

      {isLoading && <div className="mt-4 text-center">Cargando cupones...</div>}
    </div>
  );
}
