'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { toast, ToastContainer } from 'react-toastify';
import { api } from '@/lib/sdkConfig';

type PromoStatus = 'Activa' | 'Finalizada';

interface PromoItem {
  id: string;
  name: string;
  discount: number;
  status: PromoStatus;
  endDate: string;
}

interface ApiPromo {
  id: string;
  name: string;
  discountPercentage: number;
  endDate: string;
}

interface ApiPaginatedPromos {
  results: ApiPromo[];
  count: number;
  next: string | null;
  previous: string | null;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const calculateStatus = (endDate: string): PromoStatus => {
    const today = new Date();
    const promoEndDate = new Date(endDate);
    return promoEndDate >= today ? 'Activa' : 'Finalizada';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getToken = () => {
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  useEffect(() => {
    const fetchPromos = async (page: number, limit: number) => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = (await api.promo.findAll(
          { page, limit },
          token,
        )) as unknown as ApiPaginatedPromos;

        const mappedPromos: PromoItem[] = response.results.map(
          (promo: ApiPromo) => ({
            id: promo.id,
            name: promo.name,
            discount: promo.discountPercentage,
            status: calculateStatus(promo.endDate),
            endDate: formatDate(promo.endDate),
          }),
        );

        setPromos(mappedPromos);
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener promociones:', error);
        toast.error('Error al cargar las promociones');
      }
    };

    fetchPromos(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, searchQuery, router]);

  const columns: Column<PromoItem>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item: PromoItem) => item.id,
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (item: PromoItem) => item.name,
    },
    {
      key: 'discount',
      label: '% Descuento',
      render: (item: PromoItem) => `${item.discount}%`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: PromoItem) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            item.status === 'Activa'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'endDate',
      label: 'Fecha de finalización',
      render: (item: PromoItem) => item.endDate,
    },
  ];

  const handleAddPromo = () => {
    router.push('/promos/new');
  };

  const handleViewPromo = (item: PromoItem) => {
    router.push(`/promos/${item.id}`);
  };

  const handleEditPromo = (item: PromoItem) => {
    router.push(`/promos/${item.id}/edit`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

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
              title="Promos"
              tableData={promos}
              tableColumns={columns}
              onAddClick={handleAddPromo}
              onEdit={handleEditPromo}
              onView={handleViewPromo}
              addButtonText="Agregar Promo"
              onSearch={handleSearch}
              pagination={{
                currentPage,
                totalPages: Math.ceil(totalItems / itemsPerPage),
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
      <ToastContainer />
    </div>
  );
}
