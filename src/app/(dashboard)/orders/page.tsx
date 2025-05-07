'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import {
  Pagination,
  OrderResponse,
  OrderStatus,
  OrderType,
} from '@pharmatech/sdk';
import Badge from '@/components/Badge';
import { toast } from 'react-toastify';
import { formatDateSafe } from '@/lib/utils/useFormatDate';

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();

  // datos y paginación
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [query, setQuery] = useState<string>(''); // buscador libre (q)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedType, setSelectedType] = useState<OrderType | ''>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // estados de carga y error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // debounce para búsqueda
  const DEBOUNCE_MS = 500;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  // opciones de estado y tipo
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: OrderStatus.REQUESTED, label: 'Solicitado' },
    { value: OrderStatus.IN_PROGRESS, label: 'En proceso' },
    { value: OrderStatus.APPROVED, label: 'Aprobada' },
    { value: OrderStatus.CANCELED, label: 'Cancelada' },
    { value: OrderStatus.READY_FOR_PICKUP, label: 'Lista para Retiro' },
    { value: OrderStatus.COMPLETED, label: 'Completado' },
  ] as const;

  const typeOptions = [
    { value: '', label: 'Todos' },
    { value: OrderType.PICKUP, label: 'Pickup' },
    { value: OrderType.DELIVERY, label: 'Delivery' },
  ] as const;

  const handleStatusChange = (label: string) => {
    const opt = statusOptions.find((o) => o.label === label);
    setSelectedStatus(opt?.value ?? '');
    setPage(1);
  };

  const handleTypeChange = (label: string) => {
    const opt = typeOptions.find((o) => o.label === label);
    setSelectedType(opt?.value ?? '');
    setPage(1);
  };
  // trae órdenes usando SOLO los filtros que el backend expone (q + status + type)
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const params: Parameters<typeof api.order.findAll>[0] = {
        page,
        limit,
        ...(query ? { q: query } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {}),
        ...(selectedType ? { type: selectedType } : {}),
      };

      const resp: Pagination<OrderResponse> = await api.order.findAll(
        params,
        token,
      );

      setOrders(resp.results);
      setTotal(resp.count);
    } catch (err: unknown) {
      console.error('Error fetching orders:', err);
      toast.error('Error al cargar órdenes');
      setError('No se pudieron cargar las órdenes.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, query, selectedStatus, selectedType, token]);

  // recarga al cambiar filtros o paginación
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.ceil(total / limit);

  const columns: Column<OrderResponse>[] = [
    { key: 'id', label: 'ID', render: (o) => o.id.slice(0, 8) },
    {
      key: 'createdAt',
      label: 'Creación',
      render: (o) => formatDateSafe(o.createdAt),
    },
    {
      key: 'updatedAt',
      label: 'Actualización',
      render: (o) => formatDateSafe(o.updatedAt),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (o) => (
        <Badge
          variant="filled"
          color={
            o.status === OrderStatus.COMPLETED
              ? 'success'
              : o.status === OrderStatus.REQUESTED
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
    { key: 'type', label: 'Tipo', render: (o) => o.type },
    {
      key: 'totalPrice',
      label: 'Precio total',
      render: (o) => `$${o.totalPrice.toFixed(2)}`,
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

      <TableContainer<OrderResponse>
        title="Órdenes"
        onSearch={onSearch}
        dropdownComponent={
          <div className="flex space-x-2">
            <Dropdown
              title="Estado"
              items={statusOptions.map((o) => o.label)}
              onChange={handleStatusChange}
              selected={
                statusOptions.find((o) => o.value === selectedStatus)?.label ||
                'Todos'
              }
            />
            <Dropdown
              title="Tipo"
              items={typeOptions.map((o) => o.label)}
              onChange={handleTypeChange}
              selected={
                typeOptions.find((o) => o.value === selectedType)?.label ||
                'Todos'
              }
            />
          </div>
        }
        onAddClick={() => router.push('/orders/new')}
        addButtonText="Agregar orden"
        tableData={orders}
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
