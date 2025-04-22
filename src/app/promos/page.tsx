'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { toast, ToastContainer } from 'react-toastify';
import { api } from '@/lib/sdkConfig';
import Badge from '@/components/Badge';
import { PromoResponse } from '@pharmatech/sdk/types';
import { useAuth } from '@/context/AuthContext';

type PromoItem = PromoResponse & {
  status: 'Activa' | 'Finalizada';
};

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();
  const router = useRouter();

  const calculateStatus = (
    startAt: Date,
    expiredAt: Date,
  ): 'Activa' | 'Finalizada' => {
    const today = new Date();
    return today >= startAt && today <= expiredAt ? 'Activa' : 'Finalizada';
  };

  const formatDate = (input: Date | string): string => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await api.promo.findAll(
          { page: currentPage, limit: itemsPerPage },
          token,
        );

        const mapped: PromoItem[] = response.results.map((promo) => ({
          ...promo,
          status: calculateStatus(
            new Date(promo.startAt),
            new Date(promo.expiredAt),
          ),
        }));

        const filtered = searchQuery
          ? mapped.filter((p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : mapped;

        setPromos(filtered);
        setTotalItems(response.count);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error al obtener promociones:', error.message);
        } else {
          console.error('Error al obtener promociones:', error);
        }
        toast.error('Error al cargar las promociones');
      }
    };

    fetchPromos();
  }, [currentPage, itemsPerPage, searchQuery, router, token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromos((prevPromos) =>
        prevPromos.map((promo) => ({
          ...promo,
          status: calculateStatus(
            new Date(promo.startAt),
            new Date(promo.expiredAt),
          ),
        })),
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const columns: Column<PromoItem>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (item) => item.name,
    },
    {
      key: 'discount',
      label: '% Descuento',
      render: (item) => `${item.discount}%`,
    },
    {
      key: 'startAt',
      label: 'Fecha de inicio',
      render: (item) => formatDate(item.startAt),
    },
    {
      key: 'expiredAt',
      label: 'Fecha de finalización',
      render: (item) => formatDate(item.expiredAt),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <Badge
          variant="filled"
          color={item.status === 'Activa' ? 'success' : 'danger'}
          size="medium"
          borderRadius="square"
        >
          {item.status}
        </Badge>
      ),
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
              title="Promociones"
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
                onPageChange: setCurrentPage,
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
