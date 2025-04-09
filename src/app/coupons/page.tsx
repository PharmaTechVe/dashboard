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

type CouponStatus = 'Activa' | 'Finalizada';

interface CouponItem {
  id: string;
  originalId: string;
  code: string;
  discount: number;
  minPurchase: number;
  status: CouponStatus;
  expirationDate: string;
  maxUses: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
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

  const formatDateForBackend = (input: Date | string): string => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toISOString();
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

        // Calcular el índice inicial basado en la página actual
        const startIndex = (currentPage - 1) * itemsPerPage + 1;

        const mapped = response.results.map((coupon: any, index: number) => ({
          id: (startIndex + index).toString(),
          originalId: coupon.id,
          code: coupon.code,
          discount: coupon.discount,
          minPurchase: coupon.minPurchase,
          status: calculateStatus(new Date(coupon.expirationDate)),
          expirationDate: formatDate(coupon.expirationDate),
          maxUses: coupon.maxUses,
          createdAt: coupon.createdAt,
          updatedAt: coupon.updatedAt,
          deletedAt: coupon.deletedAt,
        }));

        const filtered = searchQuery
          ? mapped.filter((c) =>
              c.code.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : mapped;

        setCoupons(filtered);
        setTotalItems(response.count);
      } catch (error: any) {
        console.error('Error al obtener cupones:', error);
        toast.error('Error al cargar los cupones');
      }
    };

    fetchCoupons();
  }, [currentPage, itemsPerPage, searchQuery, router]);

  const columns: Column<CouponItem>[] = [
    { key: 'id', label: 'ID', render: (item) => item.id },
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
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge
          variant="filled"
          color={item.status === 'Activa' ? 'success' : 'info'}
          size="small"
          borderRadius="rounded"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'expirationDate',
      label: 'Fecha de finalización',
      render: (item) => item.expirationDate,
    },
  ];

  const handleAddCoupon = () => {
    router.push('/coupons/new');
  };

  const handleViewCoupon = (item: CouponItem) => {
    router.push(`/coupons/${item.originalId}`);
  };

  const handleEditCoupon = (item: CouponItem) => {
    router.push(`/coupons/${item.originalId}/edit`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCreateCoupon = async (
    newCoupon: Omit<CouponItem, 'id' | 'status'>,
  ) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const payload = {
        code: newCoupon.code,
        discount: newCoupon.discount,
        minPurchase: newCoupon.minPurchase,
        expirationDate: new Date(newCoupon.expirationDate),
        maxUses: newCoupon.maxUses,
      };

      await api.coupon.create(payload, token);
      toast.success('Cupón creado exitosamente');
      router.push('/cupones');
    } catch (error: any) {
      console.error('Error al crear cupón:', error);
      toast.error('Error al crear el cupón');
    }
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
