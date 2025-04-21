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
import { OrderResponse } from '@pharmatech/sdk/types';

type OrderItem = OrderResponse & {
  user?: { name: string };
  branch?: { name: string };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
    const fetchOrders = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await api.deliveryService.findAll({
          page: 1,
          limit: 100,
        });
        setOrders(response.results as unknown as OrderItem[]);

        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener órdenes:', error);
        toast.error('Error al cargar las órdenes');
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage, searchQuery, router]);

  const columns: Column<OrderItem>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item) => item.id.slice(0, 8),
    },
    {
      key: 'user',
      label: 'Cliente',
      render: (item) => item.user?.name || 'Sin usuario',
    },
    {
      key: 'branch',
      label: 'Sucursal',
      render: (item) => item.branch?.name || 'N/A',
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (item) => item.type,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <Badge
          variant="filled"
          color={item.status === 'completed' ? 'success' : 'info'}
          size="small"
          borderRadius="rounded"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Total',
      render: (item) => `$${item.totalPrice.toFixed(2)}`,
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (item) => formatDate(item.createdAt),
    },
  ];

  const handleViewOrder = (item: OrderItem) => {
    router.push(`/orders/${item.id}`);
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
              title="Órdenes"
              tableData={orders}
              tableColumns={columns}
              onView={handleViewOrder}
              onSearch={handleSearch}
              onAddClick={() => {}}
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
