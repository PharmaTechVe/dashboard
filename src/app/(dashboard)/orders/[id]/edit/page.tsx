'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import OrderProductList from '@/components/OrderProductList';
import OrderInfoPanel from '@/components/OrderInfoPanel';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import io from 'socket.io-client';
import { SOCKET_URL } from '@/lib/socket-url';
import { toast } from 'react-toastify';
import {
  OrderStatus,
  OrderDeliveryStatus,
  OrderDetailedResponse,
  UserList,
  UserRole,
  OrderType,
} from '@pharmatech/sdk';
import {
  orderStatusTranslationMap,
  orderDeliveryStatusTranslationMap,
} from '@/lib/utils/orderTranslations';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/app/(dashboard)/loading';
import { formatPrice } from '@/lib/utils/priceFormatter';

export default function EditOrderStatusPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token, user } = useAuth();
  const [order, setOrder] = useState<OrderDetailedResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>();
  const [deliveryStatus, setDeliveryStatus] = useState<OrderDeliveryStatus>();
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [deliveryUsers, setDeliveryUsers] = useState<UserList[]>([]);
  const [selectedDeliveryUserId, setSelectedDeliveryUserId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  const socket = io(SOCKET_URL, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
        },
      },
    },
  });

  useEffect(() => {
    function onConnect() {
      console.log('Connected to socket server');
    }

    function onDisconnect() {
      console.log('Disconnected from socket server');
    }

    async function onDeliveryUpdated(delivery: {
      orderDeliveryId: string;
      status: OrderDeliveryStatus;
      employeeId: string;
    }) {
      const response = await api.deliveryService.getById(
        delivery.orderDeliveryId,
        token!,
      );
      setDeliveryStatus(response.deliveryStatus);
      setDeliveryId(response.id);
      setSelectedDeliveryUserId(response.employeeId);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('deliveryUpdated', onDeliveryUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('deliveryUpdated', onDeliveryUpdated);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const fetchOrderData = useCallback(async () => {
    if (!token || !id) return;

    try {
      const orderData = await api.order.getById(id, token);
      setOrder(orderData);
      setOrderStatus(orderData.status);

      const deliveryRes = await api.deliveryService.findAll(
        { page: 1, limit: 10, q: '', branchId: orderData.branch?.id },
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
  }, [id, token]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  const handleSubmit = async () => {
    if (!token || !id) return;

    try {
      const orderUpdated = await api.order.update(
        id,
        { status: orderStatus },
        token,
      );
      socket.emit('updateOrder', {
        id: orderUpdated.id,
        status: orderUpdated.status,
      });

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
      socket.disconnect();
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

  if (loading || !order) {
    return <Loading />;
  }
  const isDelivery = order.type === OrderType.DELIVERY;

  if (user?.branch?.id !== order.branch?.id && user?.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto max-w-[904px] p-6">
        <h1 className="text-2xl font-semibold text-red-600">
          No tienes permiso para ver esta orden.
        </h1>
      </div>
    );
  }

  return (
    <>
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

      <div className="mx-auto flex max-w-[904px] flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-6 lg:w-2/3">
          <OrderInfoPanel
            branch={order.branch}
            selectedDeliveryUserId={selectedDeliveryUserId}
            deliveryUsers={deliveryUsers}
          />

          <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
            <Dropdown
              title="Estado de la Orden"
              placeholder="Selecciona el estado"
              width="100%"
              selected={orderStatus}
              onChange={(value) => setOrderStatus(value as OrderStatus)}
              items={Object.values(OrderStatus).map((statusKey) => ({
                label: orderStatusTranslationMap[statusKey],
                value: statusKey,
              }))}
            />

            {isDelivery && (
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
                      label: orderDeliveryStatusTranslationMap[statusKey],
                      value: statusKey,
                    }),
                  )}
                />
                <Dropdown
                  title="Asignar Repartidor"
                  placeholder="Selecciona un repartidor"
                  width="100%"
                  selected={selectedDeliveryUserId ?? ''}
                  onChange={(value) => setSelectedDeliveryUserId(value)}
                  items={deliveryUsers.map((user) => ({
                    label: user.firstName + ' ' + user.lastName,
                    value: user.id,
                  }))}
                />
              </>
            )}
          </div>

          {order.paymentConfirmation && (
            <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-2 font-semibold">Datos del Pago</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Referencia Bancaria
                  </label>
                  <p className="rounded bg-gray-50 p-2 text-sm text-gray-900">
                    {order.paymentConfirmation.reference}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Banco
                  </label>
                  <p className="rounded bg-gray-50 p-2 text-sm text-gray-900">
                    {order.paymentConfirmation.bank}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <p className="rounded bg-gray-50 p-2 text-sm text-gray-900">
                    {order.paymentConfirmation.phoneNumber}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Monto Transferido
                  </label>
                  <p className="rounded bg-gray-50 p-2 text-sm font-semibold text-gray-900">
                    ${formatPrice(order.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <OrderProductList details={order.details} total={order.totalPrice} />
      </div>
    </>
  );
}
