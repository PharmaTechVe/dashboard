'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';

type CsvRow = Record<string, string | number>;

export function useCsvUploader() {
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

  const parseCsv = useCallback((file: File) => {
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      dynamicTyping: true,
      complete: (result) => {
        const rawData = result.data as Record<string, unknown>[];
        const formatted = formatCsv(rawData);
        setCsvData(formatted);
        setFileName(file.name);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error parseando el CSV:', error);
        setLoading(false);
      },
    });
  }, []);

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
