'use client';

import { useRouter } from 'next/navigation';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export default function ReportsModulePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center px-6 py-10">
      <h1 className="text-primary mb-10 text-3xl font-bold">
        Módulo de Reportes
      </h1>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <div
          onClick={() => router.push('/reports/sales')}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-6 shadow transition hover:scale-[1.02] hover:shadow-md"
        >
          <ShoppingBagIcon className="text-primary mb-4 h-12 w-12" />
          <h2 className="text-xl font-semibold text-gray-800">
            Reporte de Ventas
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Ver el historial de ventas y descargar el PDF.
          </p>
        </div>
        <div
          onClick={() => router.push('/reports/inventory')}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-6 shadow transition hover:scale-[1.02] hover:shadow-md"
        >
          <ClipboardDocumentListIcon className="text-primary mb-4 h-12 w-12" />
          <h2 className="text-xl font-semibold text-gray-800">
            Reporte de Inventario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Consultar stock por presentación y sucursal.
          </p>
        </div>
      </div>
    </div>
  );
}
