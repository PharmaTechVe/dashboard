'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { PDFReport } from '@/components/FileHelper/PDFReport';
import { useFetchCategoriesForPdf } from '@/lib/utils/useFetchCategoriesForPdf';
import { CategoryResponse } from '@pharmatech/sdk/types';

export default function CategoriesPDFPage() {
  const { categories, loading, error } = useFetchCategoriesForPdf(40);

  if (loading) return <div className="p-4">Cargando categorías...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!categories.length)
    return <div className="p-4">No hay categorías disponibles.</div>;

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
  ] as { key: keyof CategoryResponse; label: string }[];

  return (
    <div className="h-screen w-full p-4">
      <PDFViewer width="100%" height="100%">
        <PDFReport<CategoryResponse>
          title="Listado de Categorías"
          columns={columns}
          data={categories}
        />
      </PDFViewer>
    </div>
  );
}
