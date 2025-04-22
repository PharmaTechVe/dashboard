'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
import { toast, ToastContainer } from 'react-toastify';
import { OrderResponse } from '@pharmatech/sdk/types';
import { api } from '@/lib/sdkConfig';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { token } = useAuth();

  const formatDate = (input: Date | string): string => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await api.order.findAll(
          {
            page: currentPage,
            limit: itemsPerPage,
          },
          token,
        );

        console.log('Response:', response);

        setOrders(response.results);
        setFilteredOrders(response.results); // Inicialmente, los datos filtrados son iguales a los originales
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener órdenes:', error);
        toast.error('Error al cargar las órdenes');
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage, router, token]);

  useEffect(() => {
    const filtered = searchQuery
      ? orders.filter(
          (order) =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.type.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : orders;

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const columns: Column<OrderResponse>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (item) => item.id.slice(0, 8),
    },
    {
      key: 'createdAt',
      label: 'Fecha de creación',
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: 'updatedAt',
      label: 'Última actualización',
      render: (item) => formatDate(item.updatedAt),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <Badge
          variant="filled"
          color={
            item.status === 'completed'
              ? 'success'
              : item.status === 'requested'
                ? 'warning'
                : 'info'
          }
          size="small"
          borderRadius="rounded"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Precio total',
      render: (item) => `$${item.totalPrice.toFixed(2)}`,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (item) => item.type,
    },
  ];

  const handleAdd = () => {
    router.push('/orders/new');
  };

  const handleView = (item: OrderResponse) => {
    router.push(`/orders/${item.id}`);
  };

  const handleEdit = (item: OrderResponse) => {
    router.push(`/orders/${item.id}/edit`);
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
            <TableContainer<OrderResponse>
              title="Órdenes"
              tableData={filteredOrders} // Usa los datos filtrados
              tableColumns={columns}
              onSearch={handleSearch}
              onAddClick={handleAdd}
              onEdit={handleEdit}
              onView={handleView}
              addButtonText="Agregar orden"
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
