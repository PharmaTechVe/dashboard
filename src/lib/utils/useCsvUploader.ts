'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { saveCsvData, getCsvData, clearCsvData } from '@/lib/utils/indexexDB';

type CsvRow = Record<string, string | number>;

export function useCsvUploader(storageKey: string = 'csv-inventory') {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCsv = (rawData: Record<string, unknown>[]): CsvRow[] => {
    return rawData.map((row) => {
      const formattedRow: CsvRow = {};

      for (const key in row) {
        const value = row[key];
        if (typeof value === 'string') {
          formattedRow[key] = value.trim();
        } else if (typeof value === 'number') {
          formattedRow[key] = value;
        } else if (value !== undefined && value !== null) {
          formattedRow[key] = String(value).trim();
        }
      }

      return formattedRow;
    });
  };

  const loadStoredCsv = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await getCsvData(storageKey);
      if (stored) {
        const formatted = formatCsv(stored.data);
        setCsvData(formatted);
        setFileName(stored.fileName);
      }
    } catch (error) {
      console.error('Error cargando CSV almacenado:', error);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  const parseCsv = useCallback(
    (file: File) => {
      setLoading(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        dynamicTyping: true,
        complete: async (result) => {
          try {
            const rawData = result.data as Record<string, unknown>[];
            const formatted = formatCsv(rawData);
            setCsvData(formatted);
            setFileName(file.name);
            await saveCsvData(storageKey, {
              fileName: file.name,
              data: formatted,
            });
          } catch (error) {
            console.error('Error procesando el CSV:', error);
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          console.error('Error parseando el CSV:', error);
          setLoading(false);
        },
      });
    },
    [storageKey],
  );

  const clearStoredCsv = useCallback(async () => {
    await clearCsvData(storageKey);
    setCsvData([]);
    setFileName(null);
  }, [storageKey]);

  return {
    csvData,
    fileName,
    loading,
    parseCsv,
    loadStoredCsv,
    clearStoredCsv,
  };
}
