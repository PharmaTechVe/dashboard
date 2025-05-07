'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/sdkConfig';

type CsvRow = Record<string, string | number>;

export function useCsvUploader() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parseCsv = async (file: File) => {
    setLoading(true);
    setCsvData([]);
    try {
      const text = await file.text();
      const rows = text
        .split('\n')
        .slice(1)
        .map((line) => {
          const [uuid, expirationDate, stock] = line.split(',');
          if (!uuid || !expirationDate || !stock) {
            console.warn('Línea inválida en el CSV:', line);
            return null;
          }
          return {
            uuid: uuid.trim(),
            expirationDate: expirationDate.trim(),
            stock: parseInt(stock.trim()),
          };
        });

      const enrichedRows = await Promise.all(
        rows.map(async (row) => {
          if (!row) return null;
          try {
            const res = await api.product.getProducts({ id: [row.uuid] });
            return {
              ...row,
              productName: res.results[0]?.product?.name || 'No encontrado',
              presentationName:
                res.results[0]?.presentation?.name || 'No encontrado',
            };
          } catch (err) {
            console.error('Error al enriquecer fila del CSV:', err);
            return {
              ...row,
              productName: 'No encontrado',
              presentationName: 'No encontrado',
            };
          }
        }),
      );

      // Filtrar valores null antes de asignar a setCsvData
      setCsvData(enrichedRows.filter((row) => row !== null) as CsvRow[]);
      setFileName(file.name);
    } catch (err) {
      console.error('Error leyendo CSV:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCsv = useCallback(() => {
    setCsvData([]);
    setFileName(null);
  }, []);

  return {
    csvData,
    fileName,
    loading,
    parseCsv,
    clearCsv,
  };
}
