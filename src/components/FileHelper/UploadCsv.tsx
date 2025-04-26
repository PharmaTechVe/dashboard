'use client';

import { useRef } from 'react';
import { useCsvUploader } from '@/lib/utils/useCsvUploader';

export default function CsvUploader() {
  const { csvData, fileName, loading, parseCsv, clearCsv } = useCsvUploader();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseCsv(file);
    }
  };

  const handleClearCsv = () => {
    clearCsv();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Importar Inventario CSV</h2>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="rounded border p-2"
      />
      {loading && <p>Cargando archivo...</p>}
      {fileName && (
        <div className="mt-4 flex flex-col items-center">
          <p className="font-medium">Archivo cargado: {fileName}</p>
          <button
            onClick={handleClearCsv}
            className="mt-2 text-red-500 underline"
          >
            Borrar archivo cargado
          </button>
        </div>
      )}
      {csvData.length > 0 && (
        <div className="mt-6 w-full overflow-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((key) => (
                  <th key={key} className="border bg-gray-100 px-2 py-1">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border px-2 py-1">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
