'use client';

import { useState, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import PDFReportTemplate from '@/components/FileHelper/PDFReportTemplate';
import DatePicker1 from '@/components/Calendar';
import { useFetchReport } from '@/lib/utils/useFetchReport';
import {
  ReportQueryParams,
  SalesReportItem,
  SalesReportResponse,
  StateResponse,
  CityResponse,
  BranchResponse,
} from '@pharmatech/sdk';
import { formatPrice } from '@/lib/utils/priceFormatter';
import Button from '@/components/Button';

const COUNTRY_ID = '1238bc2a-45a5-47e4-9cc1-68d573089ca1';

export default function ReportPreviewPage() {
  const { token, user } = useAuth();
  const [userName, setUserName] = useState('User');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchId, setBranchId] = useState<string | undefined>(undefined);

  const [states, setStates] = useState<StateResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);

  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    if (!token || !user?.sub) return;

    (async () => {
      try {
        setUserName(user.name);

        const stateResponse = await api.state.findAll({
          page: 1,
          limit: 100,
          countryId: COUNTRY_ID,
        });
        setStates(stateResponse.results);
      } catch (err) {
        console.error('Error inicial:', err);
      }
    })();
  }, [token, user]);

  useEffect(() => {
    if (!selectedState || !token) return;

    (async () => {
      try {
        const cityResponse = await api.city.findAll({
          page: 1,
          limit: 100,
          stateId: selectedState,
        });
        setCities(cityResponse.results);
        setSelectedCity('');
        setBranches([]);
        setBranchId(undefined);
      } catch (err) {
        console.error('Error al obtener ciudades:', err);
      }
    })();
  }, [selectedState, token]);

  useEffect(() => {
    if (!selectedCity || !token) return;

    (async () => {
      try {
        const branchResponse = await api.branch.findAll({
          page: 1,
          limit: 100,
          stateId: selectedState,
        });
        setBranches(branchResponse.results);
        setBranchId(undefined);
      } catch (err) {
        console.error('Error al obtener sucursales:', err);
      }
    })();
  }, [selectedCity, token, selectedState]);

  const params: ReportQueryParams = useMemo(() => {
    return { startDate, endDate, branchId };
  }, [startDate, endDate, branchId]);

  const { data: reportData, loading } = useFetchReport<
    SalesReportResponse,
    ReportQueryParams
  >(api.report.getSalesReport, params, token ?? '');

  const columns: { key: keyof SalesReportItem; label: string }[] = [
    { key: 'orderId', label: 'Id de Orden' },
    { key: 'user', label: 'Cliente' },
    { key: 'date', label: 'Fecha' },
    { key: 'type', label: 'Tipo' },
    { key: 'quantity', label: 'Cantidad' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'discount', label: 'Descuento' },
    { key: 'total', label: 'Total' },
  ];
  const tableData = useMemo(() => {
    return reportData?.items.map((item) => {
      return {
        ...item,
        orderId: `#${String(item.orderId).slice(0, 4)}`,
        subtotal: Number(formatPrice(item.subtotal)),
        discount: Number(formatPrice(item.discount)),
        date: new Date(item.date).toLocaleDateString('es-VE'),
        total: Number(formatPrice(item.total)),
      };
    });
  }, [reportData]);

  const handleDownload = async () => {
    if (!reportData || !startDate || !endDate) return;

    const printDate = new Date().toLocaleDateString('es-VE');

    const totals = [
      {
        label: 'Subtotal General',
        value: formatPrice(reportData.totals.subtotal),
      },
      {
        label: 'Descuento Total',
        value: formatPrice(reportData.totals.discount),
      },
      { label: 'Total Final', value: formatPrice(reportData.totals.total) },
    ];

    const blob = await pdf(
      <PDFReportTemplate<SalesReportItem>
        title="Reporte de Ventas"
        dateRange={{ start: startDate, end: endDate }}
        userName={userName}
        printDate={printDate}
        columns={columns}
        data={tableData!}
        totals={totals}
      />,
    ).toBlob();

    saveAs(blob, 'reporte-ventas.pdf');
  };

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold">Reporte de Ventas</h1>

      {/* Filtros de fecha */}
      <div className="mb-6 flex flex-col items-center justify-center gap-4 md:flex-row">
        <div className="relative">
          <label className="block text-[16px] font-medium text-gray-600">
            Fecha inicio:
          </label>
          <DatePicker1 onDateSelect={setStartDate} />
        </div>
        <div className="relative">
          <label className="block text-[16px] font-medium text-gray-600">
            Fecha fin:
          </label>
          <DatePicker1 onDateSelect={setEndDate} />
        </div>
      </div>

      {/* Filtros de ubicación */}
      <div className="mb-6 flex flex-col items-center justify-center gap-6 md:flex-row">
        <div className="relative">
          <label className="block text-[16px] font-medium text-gray-600">
            Estado:
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="mt-1 w-48 rounded border px-3 py-2"
          >
            <option value="">Selecciona un estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label className="block text-[16px] font-medium text-gray-600">
            Ciudad:
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="mt-1 w-48 rounded border px-3 py-2"
            disabled={!selectedState}
          >
            <option value="">Selecciona una ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label className="block text-[16px] font-medium text-gray-600">
            Sucursal:
          </label>
          <select
            value={branchId ?? ''}
            onChange={(e) => setBranchId(e.target.value || undefined)}
            className="mt-1 w-48 rounded border px-3 py-2"
            disabled={!selectedCity}
          >
            <option value="">Todas</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleDownload}
          className="max-w-[300px] rounded px-4 py-2"
        >
          {loading ? 'Cargando reporte...' : 'Descargar Reporte PDF'}
        </Button>
      </div>
    </div>
  );
}
