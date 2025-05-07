'use client';

import CsvUploader from '@/components/FileHelper/UploadCsv';

export default function InventoryPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Gestión de Inventario</h1>
      <CsvUploader />
    </div>
  );
}
