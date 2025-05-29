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
  UserRole,
} from '@pharmatech/sdk';
import { toast } from 'react-toastify';
import { formatDateSafe } from '@/lib/utils/useFormatDate';
import { formatPrice } from '@/lib/utils/priceFormatter';

export default function OrdersPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [query, setQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<OrderType | ''>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const DEBOUNCE_MS = 500;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const typeOptions = [
    { value: '', label: 'Todos' },
    { value: OrderType.PICKUP, label: 'Pickup' },
    { value: OrderType.DELIVERY, label: 'Delivery' },
  ] as const;

  const handleTypeChange = (label: string) => {
    const opt = typeOptions.find((o) => o.label === label);
    setSelectedType(opt?.value ?? '');
    setPage(1);
  };

  const fetchOrders = useCallback(async () => {
    if (!token || !user?.sub) return;
    setIsLoading(true);
    setError(null);

    try {
      const params: Parameters<typeof api.order.findAll>[0] = {
        page,
        limit,
        status: OrderStatus.REQUESTED,
        ...(query ? { q: query } : {}),
        ...(selectedType ? { type: selectedType } : {}),
      };

      if (user.role == UserRole.BRANCH_ADMIN) {
        params.branchId = user.branch?.id;
      }

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
  }, [page, limit, query, selectedType, token]);

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
    { key: 'type', label: 'Tipo', render: (o) => o.type },
    {
      key: 'totalPrice',
      label: 'Precio total',
      render: (o) => `$${formatPrice(o.totalPrice)}`,
    },
  ];

  const handleStatusUpdate = async (
    users: OrderResponse[],
    status: OrderStatus,
  ) => {
    api.order
      .bulkUpdate(
        {
          orders: users.map((u) => u.id),
          status: status,
        },
        token!,
      )
      .then(() => {
        toast.success('Órdenes actualizadas');
        fetchOrders();
      })
      .catch((err) => {
        console.error('Error al actualizar el status de las órdenes:', err);
        toast.error('Error al actualizar el status de las órdenes');
      });
  };

  const handleStatusUpdateToApproved = async (users: OrderResponse[]) => {
    handleStatusUpdate(users, OrderStatus.APPROVED);
  };

  const handleStatusUpdateToCanceled = async (users: OrderResponse[]) => {
    handleStatusUpdate(users, OrderStatus.CANCELED);
  };

  const handleStatusUpdateToReadyForPickup = async (users: OrderResponse[]) => {
    handleStatusUpdate(users, OrderStatus.READY_FOR_PICKUP);
  };

  const handleStatusUpdateToCompleted = async (users: OrderResponse[]) => {
    handleStatusUpdate(users, OrderStatus.COMPLETED);
  };

  const handleStatusUpdateToInProgress = async (users: OrderResponse[]) => {
    handleStatusUpdate(users, OrderStatus.IN_PROGRESS);
  };

  const actions = [
    {
      label: 'Aprobar',
      onClick: handleStatusUpdateToApproved,
    },
    {
      label: 'Cancelar',
      onClick: handleStatusUpdateToCanceled,
    },
    {
      label: 'Listar para Retiro',
      onClick: handleStatusUpdateToReadyForPickup,
    },
    {
      label: 'Completar',
      onClick: handleStatusUpdateToCompleted,
    },
    {
      label: 'Marcar como En Proceso',
      onClick: handleStatusUpdateToInProgress,
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
        title="Órdenes Solicitadas"
        onSearch={onSearch}
        actions={actions}
        dropdownComponent={
          <Dropdown
            title="Tipo"
            items={typeOptions.map((o) => o.label)}
            onChange={handleTypeChange}
            selected={
              typeOptions.find((o) => o.value === selectedType)?.label ||
              'Todos'
            }
          />
        }
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
        isLoading={isLoading}
      />
    </div>
  );
}
