'use client';

import CsvUploader from '@/components/FileHelper/UploadCsv';

export default function InventoryPage() {
  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Gestión de Inventario
      </h1>
      <CsvUploader />
    </div>
  );
}
