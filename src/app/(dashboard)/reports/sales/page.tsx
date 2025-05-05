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
// Constant that represents the ID of Venezuela.Used to Fetch states and cities.
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
        const profile = await api.user.getProfile(user.sub, token);
        setUserName(`${profile.firstName} ${profile.lastName}`);

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
  }, [selectedCity, token]);

  const params: ReportQueryParams = useMemo(() => {
    return { startDate, endDate, branchId };
  }, [startDate, endDate, branchId]);

  const { data: reportData, loading } = useFetchReport<
    SalesReportResponse,
    ReportQueryParams
  >(api.report.getSalesReport, params, token ?? '');

  const columns: { key: keyof SalesReportItem; label: string }[] = [
    { key: 'productName', label: 'Producto' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'discount', label: 'Descuento' },
    { key: 'total', label: 'Total' },
  ];

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

  const handleDownload = async () => {
    if (!reportData || !startDate || !endDate) return;

    const printDate = new Date().toLocaleDateString('es-VE');

    const totals = [
      {
        label: 'Subtotal General',
        value: formatCurrency(reportData.totals.subtotal),
      },
      {
        label: 'Descuento Total',
        value: formatCurrency(reportData.totals.discount),
      },
      { label: 'Total Final', value: formatCurrency(reportData.totals.total) },
    ];

    const blob = await pdf(
      <PDFReportTemplate<SalesReportItem>
        title="Reporte de Ventas"
        dateRange={{ start: startDate, end: endDate }}
        userName={userName}
        printDate={printDate}
        columns={columns}
        data={reportData.items}
        totals={totals}
      />,
    ).toBlob();

    saveAs(blob, 'reporte-ventas.pdf');
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">Reporte de Ventas</h1>

      <div className="mb-4 flex flex-col gap-4 md:flex-row">
        <div>
          <label className="text-sm font-medium">Fecha inicio:</label>
          <DatePicker1 onDateSelect={setStartDate} />
        </div>
        <div>
          <label className="text-sm font-medium">Fecha fin:</label>
          <DatePicker1 onDateSelect={setEndDate} />
        </div>
        <div>
          <label className="text-sm font-medium">Estado:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Selecciona un estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Ciudad:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
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
        <div>
          <label className="text-sm font-medium">Sucursal:</label>
          <select
            value={branchId ?? ''}
            onChange={(e) => setBranchId(e.target.value || undefined)}
            className="mt-1 w-full rounded border px-3 py-2"
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

      <button
        onClick={handleDownload}
        className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Cargando reporte...' : 'Descargar Reporte PDF'}
      </button>
    </div>
  );
}
