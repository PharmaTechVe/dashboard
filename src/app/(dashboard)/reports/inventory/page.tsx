'use client';

import { useEffect, useState, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import PDFReportTemplate from '@/components/FileHelper/PDFReportTemplate';

import {
  ProductPresentationResponse,
  ProductPresentationDetailResponse,
  StateResponse,
  CityResponse,
} from '@pharmatech/sdk';

const COUNTRY_ID = '1238bc2a-45a5-47e4-9cc1-68d573089ca1';

export default function InventoryReportPreview() {
  const { token, user } = useAuth();

  const [userName, setUserName] = useState('Usuario');
  const [states, setStates] = useState<StateResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [productData, setProductData] = useState<ProductPresentationResponse[]>(
    [],
  );
  const [detailsMap, setDetailsMap] = useState<
    Record<string, ProductPresentationDetailResponse>
  >({});

  useEffect(() => {
    if (!token || !user?.sub) return;

    (async () => {
      const profile = await api.user.getProfile(user.sub, token);
      setUserName(`${profile.firstName} ${profile.lastName}`);

      const stateRes = await api.state.findAll({
        page: 1,
        limit: 100,
        countryId: COUNTRY_ID,
      });
      setStates(stateRes.results);
    })();
  }, [token, user]);

  useEffect(() => {
    if (!selectedState || !token) return;

    (async () => {
      const cityRes = await api.city.findAll({
        page: 1,
        limit: 100,
        stateId: selectedState,
      });
      setCities(cityRes.results);
      setSelectedCity('');
    })();
  }, [selectedState, token]);

  const fetchData = async () => {
    const res = await api.product.getProducts({ page: 1, limit: 100 });
    setProductData(res.results);

    const detailMap: Record<string, ProductPresentationDetailResponse> = {};
    for (const prod of res.results) {
      const detail = await api.productPresentation.getByPresentationId(
        prod.product.id,
        prod.presentation.id,
      );
      detailMap[prod.presentation.id] = detail;
    }

    setDetailsMap(detailMap);
  };

  const columns: {
    key:
      | 'genericName'
      | 'presentationName'
      | 'stockQuantity'
      | 'price'
      | 'totalValue';
    label: string;
  }[] = [
    { key: 'genericName', label: 'Nombre Genérico' },
    { key: 'presentationName', label: 'Presentación' },
    { key: 'stockQuantity', label: 'Stock' },
    { key: 'price', label: 'Precio' },
    { key: 'totalValue', label: 'Valor Total' },
  ];

  const tableData = useMemo(() => {
    return productData.map((p) => {
      const detail = detailsMap[p.presentation.id];
      const genericName = detail?.product?.genericName || '-';
      const presentationName = detail?.presentation?.name || '-';
      const stock = p.stock ?? 0;
      const price = p.price;

      return {
        genericName,
        presentationName,
        stockQuantity: stock,
        price,
        totalValue: stock * price,
      };
    });
  }, [productData, detailsMap]);

  const handleDownload = async () => {
    const printDate = new Date().toLocaleDateString('es-VE');
    const totalValue = tableData
      .reduce((acc, row) => acc + row.totalValue, 0)
      .toFixed(2);

    const blob = await pdf(
      <PDFReportTemplate
        title="Reporte de Inventario"
        userName={userName}
        printDate={printDate}
        columns={columns}
        data={tableData}
        totals={[
          { label: 'Valor Total del Inventario', value: `${totalValue} $` },
        ]}
      />,
    ).toBlob();

    saveAs(blob, 'reporte-inventario.pdf');
  };

  return (
    <div className="p-6">
      <h1 className="text-primary mb-4 text-xl font-bold">
        Reporte de Inventario
      </h1>

      <div className="mb-4 flex flex-col gap-4 md:flex-row">
        <div>
          <label>Estado:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Selecciona un estado</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Ciudad:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Selecciona una ciudad</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="self-end">
          <button
            onClick={fetchData}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Consultar
          </button>
        </div>
      </div>

      {tableData.length > 0 && (
        <button
          onClick={handleDownload}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Descargar Reporte PDF
        </button>
      )}
    </div>
  );
}
