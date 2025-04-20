'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import type { PresentationResponse } from '@pharmatech/sdk';

type PresentationItem = PresentationResponse;

export default function PresentationListPage() {
  const [presentations, setPresentations] = useState<PresentationItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const { token, user, loading } = useAuth();
  const router = useRouter();
  const tokenChecked = useRef(false);

  useEffect(() => {
    if (!loading && (!token || !user?.sub)) {
      if (!tokenChecked.current) {
        router.replace('/login');
        tokenChecked.current = true;
      }
    }
  }, [token, user, loading, router]);

  const fetchPresentations = useCallback(
    async (page: number, limit: number) => {
      try {
        const response = await api.presentation.findAll({ page, limit });
        setPresentations(response.results);
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error fetching presentations:', error);
      } finally {
        setLoadingData(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!token || !user?.sub) return;
    fetchPresentations(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, token, user, fetchPresentations]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<PresentationItem>[] = [
    {
      key: 'name',
      label: 'Presentación',
      render: (item) => item.name,
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (item) => item.description,
    },
    {
      key: 'quantity',
      label: 'Cantidad',
      render: (item) => item.quantity,
    },
    {
      key: 'measurementUnit',
      label: 'Unidad de medida',
      render: (item) => item.measurementUnit,
    },
  ];

  const handleEdit = (item: PresentationItem) => {
    router.push(`/presentations/${item.id}/edit`);
  };

  const handleView = (item: PresentationItem) => {
    router.push(`/presentations/${item.id}`);
  };

  const handleAdd = () => {
    router.push(`/presentations/new`);
  };

  if (loading || !token || !user?.sub || loadingData) {
    return <h1 className="p-4 text-lg">Cargando presentaciones...</h1>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 150px)' }}
          >
            <TableContainer
              title="Presentaciones"
              onAddClick={handleAdd}
              onSearch={(query) => console.log('Buscando presentación:', query)}
              tableData={presentations}
              tableColumns={columns}
              onEdit={handleEdit}
              onView={handleView}
              addButtonText="Agregar presentación"
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: (page) => setCurrentPage(page),
                onItemsPerPageChange: (val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                },
                itemsPerPageOptions: [5, 10, 15, 20],
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
