'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import {
  OrderStatus,
  OrderDeliveryStatus,
  OrderDetailedResponse,
  UserList,
  UserRole,
} from '@pharmatech/sdk';

export default function EditOrderStatusPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();

  const [, setOrder] = useState<OrderDetailedResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>();
  const [deliveryStatus, setDeliveryStatus] = useState<OrderDeliveryStatus>();
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [deliveryUsers, setDeliveryUsers] = useState<UserList[]>([]);
  const [selectedDeliveryUserId, setSelectedDeliveryUserId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  }, []);

  const fetchOrderData = useCallback(async () => {
    const token = getToken();
    if (!token || !id) return;

    try {
      const orderData = await api.order.getById(id, token);
      setOrder(orderData);
      setOrderStatus(orderData.status);

      const deliveryRes = await api.deliveryService.findAll(
        {
          page: 1,
          limit: 10,
          q: '',
          branchId: orderData.branch?.id,
        },
        token,
      );

      const delivery = deliveryRes.results.find((d) => d.orderId === id);
      if (delivery) {
        setDeliveryId(delivery.id);
        setDeliveryStatus(delivery.deliveryStatus);
        if (delivery.employeeId) {
          setSelectedDeliveryUserId(delivery.employeeId);
        }
      }

      const usersRes = await api.user.findAll(
        { page: 1, limit: 100, role: UserRole.DELIVERY },
        token,
      );
      setDeliveryUsers(usersRes.results);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar la orden o los datos del delivery');
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  const handleSubmit = async () => {
    const token = getToken();
    if (!token || !id) return;

    try {
      await api.order.update(id, { status: orderStatus }, token);
      console.log('Orden actualizada:', id);
      console.log('DeliveryId', selectedDeliveryUserId);
      if (deliveryId && deliveryStatus) {
        await api.deliveryService.update(
          deliveryId,
          {
            deliveryStatus,
            employeeId: selectedDeliveryUserId ?? undefined,
          },
          token,
        );
      }

      toast.success('Orden actualizada correctamente');
      setTimeout(() => router.push('/orders'), 2000);
    } catch (error) {
      console.error('Error actualizando la orden:', error);
      toast.error('No se pudo actualizar la orden');
    }
  };

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Órdenes', href: '/orders' },
    { label: `Editar Orden #${id.slice(0, 6)}`, href: '' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-6">Cargando orden...</main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <div className="mx-auto mb-4 max-w-[904px]">
              <Breadcrumb items={breadcrumbItems} />
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-[28px] font-normal text-[#393938]">
                  Editar Estado de Orden
                </h1>
                <div className="flex space-x-4">
                  <Button
                    color={Colors.textWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="auto"
                    onClick={() => router.back()}
                    textColor={Colors.textMain}
                  >
                    Cancelar
                  </Button>
                  <Button
                    color={Colors.primary}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="auto"
                    onClick={handleSubmit}
                    textColor={Colors.textWhite}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-[904px] space-y-6 rounded-xl bg-white p-6 shadow-md">
              <Dropdown
                title="Estado de la Orden"
                placeholder="Selecciona el estado"
                width="100%"
                selected={orderStatus}
                onChange={(value) => setOrderStatus(value as OrderStatus)}
                items={Object.values(OrderStatus).map((statusKey) => ({
                  label: statusKey,
                  value: statusKey,
                }))}
              />

              {deliveryId && (
                <>
                  <Dropdown
                    title="Estado del Delivery"
                    placeholder="Selecciona el estado del delivery"
                    width="100%"
                    selected={deliveryStatus}
                    onChange={(value) =>
                      setDeliveryStatus(value as OrderDeliveryStatus)
                    }
                    items={Object.values(OrderDeliveryStatus).map(
                      (statusKey) => ({
                        label: statusKey,
                        value: statusKey,
                      }),
                    )}
                  />

                  <Dropdown
                    title="Asignar Repartidor"
                    placeholder="Selecciona un repartidor"
                    width="100%"
                    selected={selectedDeliveryUserId ?? ''}
                    onChange={(value) =>
                      setSelectedDeliveryUserId(value as string)
                    }
                    items={deliveryUsers.map((user) => ({
                      label: user.id,
                      value: user.id,
                    }))}
                  />
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
