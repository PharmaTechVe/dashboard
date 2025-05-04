'use client';

import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import PDFReportTemplate from '@/components/FileHelper/PDFReportTemplate';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/sdkConfig';

interface ReportRow {
  id: string;
  product: string;
  quantity: number;
  price: string;
}

const columns: { key: keyof ReportRow; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'product', label: 'Producto' },
  { key: 'quantity', label: 'Cantidad' },
  { key: 'price', label: 'Precio' },
];

const data: ReportRow[] = [
  { id: '1', product: 'Ibuprofeno 400mg', quantity: 5, price: '$15.00' },
  { id: '2', product: 'Paracetamol 500mg', quantity: 8, price: '$20.00' },
  { id: '3', product: 'Omeprazol 20mg', quantity: 3, price: '$10.00' },
];

const totals = [
  { label: 'Total Productos', value: '16' },
  { label: 'Total Precio', value: '$45.00' },
];

export default function ReportPreviewPage() {
  const { token, user } = useAuth();
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    if (!token || !user?.sub) return;

    (async () => {
      try {
        const profile = await api.user.getProfile(user.sub, token);
        const fullName = `${profile.firstName} ${profile.lastName}`;
        setUserName(fullName);
      } catch (error) {
        console.error('Error obteniendo el perfil del usuario:', error);
      }
    })();
  }, [token, user]);

  const handleDownload = async () => {
    const printDate = new Date().toLocaleDateString('es-VE');

    const blob = await pdf(
      <PDFReportTemplate<ReportRow>
        title="Reporte de inventario"
        dateRange={{ start: '01/05/2025', end: '03/05/2025' }}
        userName={userName}
        printDate={printDate}
        columns={columns}
        data={data}
        totals={totals}
      />,
    ).toBlob();

    saveAs(blob, 'reporte-productos.pdf');
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">Reporte de Inventario</h1>

      <button
        onClick={handleDownload}
        className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
      >
        Descargar Reporte PDF
      </button>
    </div>
  );
}
