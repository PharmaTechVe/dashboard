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
import { CouponResponse } from '@pharmatech/sdk/types'; // Usa el tipo exportado

type CouponStatus = 'Activa' | 'Finalizada';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]); // Usa CouponResponse
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const calculateStatus = (expirationDate: Date): CouponStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expirationDate);
    exp.setHours(0, 0, 0, 0);
    return exp >= today ? 'Activa' : 'Finalizada';
  };

  const formatDate = (input: Date | string): string => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getToken = () => {
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken') ||
      ''
    );
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await api.coupon.findAll(
          { page: currentPage, limit: itemsPerPage },
          token,
        );

        const filtered = searchQuery
          ? response.results.filter((coupon) =>
              coupon.code.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : response.results;

        setCoupons(filtered);
        setTotalItems(response.count);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error al obtener cupones:', error.message);
        } else {
          console.error('Error al obtener cupones:', error);
        }
        toast.error('Error al cargar los cupones');
      }
    };

    fetchCoupons();
  }, [currentPage, itemsPerPage, searchQuery, router]);

  const columns: Column<CouponResponse>[] = [
    { key: 'code', label: 'Código', render: (item) => item.code },
    {
      key: 'discount',
      label: '% Descuento',
      render: (item) => `${item.discount}%`,
    },
    {
      key: 'minPurchase',
      label: 'Compra min.',
      render: (item) => `$${item.minPurchase.toFixed(2)}`,
    },
    {
      key: 'maxUses',
      label: 'Máx. usos',
      render: (item) => item.maxUses,
    },
    {
      key: 'expirationDate',
      label: 'Fecha de finalización',
      render: (item) => formatDate(item.expirationDate),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge
          variant="filled"
          color={
            calculateStatus(new Date(item.expirationDate)) === 'Activa'
              ? 'success'
              : 'info'
          }
          size="small"
          borderRadius="rounded"
        >
          {calculateStatus(new Date(item.expirationDate))}
        </Badge>
      ),
    },
  ];

  const handleAddCoupon = () => {
    router.push('/coupons/new');
  };

  const handleViewCoupon = (item: CouponResponse) => {
    router.push(`/coupons/${item.code}`);
  };

  const handleEditCoupon = (item: CouponResponse) => {
    router.push(`/coupons/${item.code}/edit`);
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
              title="Cupones"
              tableData={coupons}
              tableColumns={columns}
              onAddClick={handleAddCoupon}
              onEdit={handleEditCoupon}
              onView={handleViewCoupon}
              addButtonText="Agregar Cupón"
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
