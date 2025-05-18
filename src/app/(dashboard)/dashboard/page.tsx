'use client';

import { useEffect, useState, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/sdkConfig';
import { DashboardResponse, ReportQueryParams } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts';
import Calendar from '@/components/Calendar';
import { Colors, FontSizes } from '@/styles/styles';
import { getCurrentMonthDates, getPreviousPeriod } from '@/lib/utils/DateUtils';

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [prevStats, setPrevStats] = useState<DashboardResponse | null>(null);
  const [sales, setSales] = useState<
    { date: string; total: number; predictedTotal: number }[]
  >([]);

  const pieData = [
    { name: 'Órdenes Abiertas', value: stats?.openOrders ?? 0 },
    {
      name: 'Órdenes Completadas',
      value: stats?.completedOrders ?? 0,
    },
  ];

  const COLORS = [Colors.secondaryLight, Colors.primary];

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

      const prevRange = getPreviousPeriod(fromDate, toDate);
      const prevResponse = await api.report.getDashboard(prevRange, token);
      setPrevStats(prevResponse);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error al cargar el resumen del dashboard');
    } finally {
    }
  }, [token, fromDate, toDate]);

  const fetchSales = useCallback(async () => {
    if (!token) return;

    try {
      const params: ReportQueryParams = {
        startDate: fromDate || '',
        endDate: toDate || '',
      };

      const response = await api.report.getSalesReport(params, token);
      setSales(
        response.items.map((item) => ({
          date: item.date.split('T')[0],
          total: item.total,
          predictedTotal: 0,
        })),
      );
      const prediction = await api.salesPrediction.getPredictedSales(
        { days: 5 },
        token,
      );
      setSales((prevSales) => [
        ...prevSales,
        ...prediction.map((item) => ({
          date: item.date.split('T')[0],
          predictedTotal: Math.round(item.predictedTotal / 1000),
          total: 0,
        })),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error al cargar las ventas');
    } finally {
    }
  }, [token, fromDate, toDate]);

  useEffect(() => {
    fetchDashboardStats();
    fetchSales();
  }, [fetchDashboardStats, fetchSales]);

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
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Órdenes Activas"
          value={stats?.openOrders ?? 0}
          previousValue={prevStats?.openOrders}
        />
        <StatCard
          title="Órdenes Completadas"
          value={stats?.completedOrders ?? 0}
          previousValue={prevStats?.completedOrders}
        />
        <StatCard
          title="Total de Nuevos Clientes"
          value={stats?.totalNewUsers ?? 0}
          previousValue={prevStats?.totalNewUsers}
        />
        <StatCard
          title="Total de Ventas"
          value={stats?.totalSales ?? 0}
          previousValue={prevStats?.totalSales}
          prefix="$"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Gráfico de órdenes actuales */}
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

        {/* Gráfico de órdenes del periodo anterior */}
        <div className="mx-auto w-full rounded-xl bg-white p-6 shadow-md">
          <h2 className="my-4 text-center text-lg font-semibold">
            Distribución del Periodo Anterior
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: 'Órdenes Abiertas',
                    value: prevStats?.openOrders ?? 0,
                  },
                  {
                    name: 'Órdenes Completadas',
                    value: prevStats?.completedOrders ?? 0,
                  },
                ]}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {[
                  {
                    name: 'Órdenes Abiertas',
                    value: prevStats?.openOrders ?? 0,
                  },
                  {
                    name: 'Órdenes Completadas',
                    value: prevStats?.completedOrders ?? 0,
                  },
                ].map((_, index) => (
                  <Cell
                    key={`cell-prev-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Comparación Total de Ventas */}
        <div className="mx-auto w-full rounded-xl bg-white p-6 shadow-md">
          <h2 className="my-4 text-center text-lg font-semibold">
            Comparación de Ventas
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={
                [
                  {
                    name: 'Actual',
                    value: stats?.totalSales ?? 0,
                  },
                  {
                    name: 'Anterior',
                    value: prevStats?.totalSales ?? 0,
                  },
                ] as { name: string; value: number }[]
              }
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {[stats?.totalSales ?? 0, prevStats?.totalSales ?? 0].map(
                  (_, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ),
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparación Total de Clientes */}
        <div className="mx-auto w-full rounded-xl bg-white p-6 shadow-md">
          <h2 className="my-4 text-center text-lg font-semibold">
            Comparación de Nuevos Clientes
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                {
                  name: 'Actual',
                  value: stats?.totalNewUsers ?? 0,
                },
                {
                  name: 'Anterior',
                  value: prevStats?.totalNewUsers ?? 0,
                },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {[stats?.totalSales ?? 0, prevStats?.totalSales ?? 0].map(
                  (_, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ),
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mx-auto w-full rounded-xl bg-white p-6 shadow-md">
        <h2 className="my-4 text-center text-lg font-semibold">
          Predicción de Ventas
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            width={730}
            height={250}
            data={sales}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke={COLORS[1]} />
            <Line type="monotone" dataKey="predictedTotal" stroke={COLORS[0]} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
