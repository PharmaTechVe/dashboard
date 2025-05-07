'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { Pagination, PromoResponse } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/Badge';
import { toast } from 'react-toastify';
import { formatDateSafe, parseApiDate } from '@/lib/utils/useFormatDate';

// Presets de rango de expiración que el backend acepta via expirationBetween
const expirationTranslations: Record<string, string> = {
  '': 'Todos',
  '7': 'Próximos 7 días',
  '30': 'Próximos 30 días',
  '90': 'Próximos 90 días',
};
const expirationOptions = Object.entries(expirationTranslations).map(
  ([value, label]) => ({ value, label }),
);

export default function PromosPage() {
  const { token } = useAuth();
  const router = useRouter();

  // datos, paginación y filtros
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // loading y error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // debounce para búsqueda
  const DEBOUNCE_MS = 500;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  // cambia el preset de expiración
  const handlePeriodChange = (label: string) => {
    const opt = expirationOptions.find((o) => o.label === label);
    setSelectedPeriod(opt?.value ?? '');
    setPage(1);
  };

  // función que trae promos con **solo** filtros del back: q + expirationBetween
  const fetchPromos = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    const params: Parameters<typeof api.promo.findAll>[0] = { page, limit };
    if (searchQuery) params.q = searchQuery;
    if (selectedPeriod) {
      const days = parseInt(selectedPeriod, 10);
      const start = new Date();
      const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      params.expirationBetween = { start, end };
    }

    try {
      const response: Pagination<PromoResponse> = await api.promo.findAll(
        params,
        token,
      );
      setPromos(response.results);
      setTotalItems(response.count);
    } catch (err: unknown) {
      console.error('Error fetching promos:', err);
      toast.error('Error al cargar promociones');
      setError('No se pudieron cargar las promociones.');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, limit, searchQuery, selectedPeriod]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const totalPages = Math.ceil(totalItems / limit);

  // calcular estado para columna

  const calcStatus = (
    start: string | Date,
    end: string | Date,
  ): 'Activa' | 'Finalizada' => {
    const now = new Date();
    const parsedEnd = parseApiDate(end);
    return now <= parsedEnd ? 'Activa' : 'Finalizada';
  };
  // definición de columnas
  const columns: Column<PromoResponse>[] = [
    { key: 'name', label: 'Nombre', render: (p: PromoResponse) => p.name },
    {
      key: 'discount',
      label: '% Dcto',
      render: (p: PromoResponse) => `${p.discount}%`,
    },
    {
      key: 'startAt',
      label: 'Inicio',
      render: (p: PromoResponse) => formatDateSafe(p.startAt),
    },
    {
      key: 'expiredAt',
      label: 'Fin',
      render: (p: PromoResponse) => formatDateSafe(p.expiredAt),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (p: PromoResponse) => {
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
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      <TableContainer<PromoResponse>
        title="Promociones"
        onSearch={handleSearch}
        dropdownComponent={
          <Dropdown
            title="Expira en"
            items={expirationOptions.map((o) => o.label)}
            onChange={handlePeriodChange}
          />
        }
        onAddClick={() => router.push('/promos/new')}
        addButtonText="Agregar Promo"
        tableData={promos}
        tableColumns={columns}
        onView={(p) => router.push(`/promos/${p.id}`)}
        onEdit={(p) => router.push(`/promos/${p.id}/edit`)}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
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
