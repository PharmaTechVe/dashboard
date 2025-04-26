'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { saveCsvData, getCsvData, clearCsvData } from '@/lib/utils/indexexDB';

type CsvRow = Record<string, string | number>;

export function useCsvUploader(storageKey: string = 'csv-inventory') {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateAndFormatCsv = (
    rawData: Record<string, unknown>[],
  ): CsvRow[] => {
    const validated: CsvRow[] = [];

    for (const row of rawData) {
      // Intentamos extraer los campos requeridos
      const productPresentationId =
        typeof row.productPresentationId === 'string'
          ? row.productPresentationId.trim()
          : '';
      const branchId =
        typeof row.branchId === 'string' ? row.branchId.trim() : '';
      const branchName =
        typeof row.branchName === 'string' ? row.branchName.trim() : '';
      const stockQuantityRaw = row.stockQuantity;

      // Validar que los campos requeridos existan
      if (
        !productPresentationId ||
        !branchId ||
        !branchName ||
        stockQuantityRaw === undefined ||
        stockQuantityRaw === null
      ) {
        console.error(
          'Fila inválida encontrada (faltan campos requeridos):',
          row,
        );
        continue; // Saltamos esta fila
      }

      // Convertir stockQuantity a número
      const stockQuantity =
        typeof stockQuantityRaw === 'number'
          ? stockQuantityRaw
          : Number(stockQuantityRaw);

      if (isNaN(stockQuantity)) {
        console.error('Stock quantity no es un número válido:', row);
        continue; // Saltamos esta fila
      }

      // Guardamos toda la fila, manteniendo campos extra si existen
      validated.push({
        ...row,
        productPresentationId,
        branchId,
        branchName,
        stockQuantity,
      });
    }

    return validated;
  };

  const loadStoredCsv = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await getCsvData(storageKey);
      if (stored) {
        const validated = validateAndFormatCsv(stored.data);
        setCsvData(validated);
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
        quoteChar: '"', // <- para corregir el problema de las comillas dobles
        dynamicTyping: true, // <- convierte números automáticamente
        complete: async (result) => {
          try {
            const rawData = result.data as Record<string, unknown>[];
            const validated = validateAndFormatCsv(rawData);
            setCsvData(validated);
            setFileName(file.name);
            await saveCsvData(storageKey, {
              fileName: file.name,
              data: validated,
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
