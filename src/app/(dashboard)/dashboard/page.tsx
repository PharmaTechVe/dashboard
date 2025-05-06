'use client';

import { useEffect, useState, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import {
  DashboardResponse,
  ReportQueryParams,
  OrderResponse,
  OrderStatus,
  OrderType,
  Pagination,
} from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Calendar from '@/components/Calendar';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { Colors, FontSizes } from '@/styles/styles';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardResponse | null>(null);

  const pieData = [
    { name: 'Órdenes Abiertas', value: stats?.openOrders ?? 0 },
    {
      name: 'Órdenes Completadas',
      value: stats?.completedOrders ?? 0,
    },
  ];

  const COLORS = [Colors.secondaryLight, Colors.primary];

  // Fechas
  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    return { firstDay, lastDay };
  };

  const { firstDay, lastDay } = getCurrentMonthDates();
  const [fromDate, setFromDate] = useState<string>(firstDay);
  const [toDate, setToDate] = useState<string>(lastDay);

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;

    try {
      const params: ReportQueryParams = {
        startDate: fromDate || '',
        endDate: toDate || '',
      };

      const response = await api.report.getDashboard(params, token);
      setStats(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error al cargar el resumen del dashboard');
    } finally {
    }
  }, [token, fromDate, toDate]);

  // Tabla de órdenes
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [query, setQuery] = useState<string>(''); // Búsqueda
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>(''); // Filtro de estado
  const [selectedType, setSelectedType] = useState<OrderType | ''>(''); // Filtro de tipo
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: OrderStatus.REQUESTED, label: 'Solicitado' },
    { value: OrderStatus.IN_PROGRESS, label: 'En proceso' },
    { value: OrderStatus.APPROVED, label: 'Aprobada' },
    { value: OrderStatus.CANCELED, label: 'Cancelada' },
    { value: OrderStatus.READY_FOR_PICKUP, label: 'Lista para Retiro' },
    { value: OrderStatus.COMPLETED, label: 'Completado' },
  ];

  const typeOptions = [
    { value: '', label: 'Todos' },
    { value: OrderType.PICKUP, label: 'Pickup' },
    { value: OrderType.DELIVERY, label: 'Delivery' },
  ];

  const fetchOrders = useCallback(async () => {
    if (!token) return;

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
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar órdenes');
    } finally {
    }
  }, [token, page, limit, query, selectedStatus, selectedType]);

  useEffect(() => {
    fetchDashboardStats();
    fetchOrders();
  }, [fetchDashboardStats, fetchOrders]);

  const columns = [
    { key: 'id', label: 'ID', render: (o: OrderResponse) => o.id.slice(0, 8) },
    {
      key: 'createdAt',
      label: 'Creación',
      render: (o: OrderResponse) => new Date(o.createdAt).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (o: OrderResponse) => (
        <Badge variant="filled" color="info" size="medium">
          {o.status}
        </Badge>
      ),
    },
    { key: 'type', label: 'Tipo', render: (o: OrderResponse) => o.type },
    {
      key: 'totalPrice',
      label: 'Precio Total',
      render: (o: OrderResponse) => `$${o.totalPrice.toFixed(2)}`,
    },
  ];

  return (
    <div className="mx-auto max-w-full space-y-6 p-6">
      <h1
        className="text-2xl font-semibold"
        style={{
          color: Colors.textMain,
          fontSize: FontSizes.h2.size,
          lineHeight: `${FontSizes.h2.lineHeight}px`,
        }}
      >
        ¡Bienvenido, {user?.name || 'Usuario'}!
      </h1>

      {/* Filtros de fechas */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-700">Desde:</label>
          <Calendar
            initialDate={fromDate}
            onDateSelect={(date) => setFromDate(date)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Hasta:</label>
          <Calendar
            initialDate={toDate}
            onDateSelect={(date) => setToDate(date)}
          />
        </div>
        <Button
          onClick={fetchDashboardStats}
          color={Colors.primary}
          textColor={Colors.textWhite}
          paddingX={4}
          paddingY={2}
          textSize="base"
          width="auto"
          height="42px"
          className="self-end"
        >
          Filtrar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Órdenes Activas" value={stats?.openOrders ?? 0} />
        <StatCard
          title="Órdenes Completadas"
          value={stats?.completedOrders ?? 0}
        />
        <StatCard
          title="Total de Nuevos Clientes"
          value={stats?.totalNewUsers ?? 0}
        />
        <StatCard title="Total de Ventas" value={stats?.totalSales ?? 0} />
      </div>
      <div className="mx-auto w-full rounded-xl bg-white p-6 shadow-md">
        <h2 className="my-4 text-center text-lg font-semibold">
          Distribución de Órdenes Abiertas
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de órdenes */}
      <TableContainer<OrderResponse>
        title="Órdenes"
        tableData={orders}
        tableColumns={columns}
        onView={(o) => router.push(`/orders/${o.id}`)}
        onEdit={(o) => router.push(`/orders/${o.id}/edit`)}
        onSearch={(searchTerm) => setQuery(searchTerm)}
        addButtonText="Ir al listado de órdenes"
        onAddClick={() => router.push('/orders/')}
        dropdownComponent={
          <div className="flex space-x-2">
            <Dropdown
              title="Estado"
              items={statusOptions.map((o) => o.label)}
              onChange={(label) => {
                const opt = statusOptions.find((o) => o.label === label);
                setSelectedStatus((opt?.value as OrderStatus) ?? '');
                setPage(1);
              }}
              selected={
                statusOptions.find((o) => o.value === selectedStatus)?.label ||
                'Todos'
              }
            />
            <Dropdown
              title="Tipo"
              items={typeOptions.map((o) => o.label)}
              onChange={(label) => {
                const opt = typeOptions.find((o) => o.label === label);
                setSelectedType((opt?.value as OrderType) ?? '');
                setPage(1);
              }}
              selected={
                typeOptions.find((o) => o.value === selectedType)?.label ||
                'Todos'
              }
            />
          </div>
        }
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(total / limit),
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
