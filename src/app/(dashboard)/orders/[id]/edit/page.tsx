'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
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
import { useAuth } from '@/context/AuthContext';
import Loading from '@/app/(dashboard)/loading';
import Image from 'next/image';

export default function EditOrderStatusPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token } = useAuth();
  const socket = io(SOCKET_URL, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
        },
      },
    },
  });
  const [order, setOrder] = useState<OrderDetailedResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>();
  const [deliveryStatus, setDeliveryStatus] = useState<OrderDeliveryStatus>();
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [deliveryUsers, setDeliveryUsers] = useState<UserList[]>([]);
  const [selectedDeliveryUserId, setSelectedDeliveryUserId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  type SocketError = {
    message: string;
    data: { id: string };
  };

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected: ', isConnected);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket connected: ', isConnected);
    });

    socket.on('error', (error: SocketError) => {
      console.error('Socket error: ', error);
      toast.error('Error de conexión con el servidor');
    });

    return () => {
      socket.disconnect();
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
      socket.emit('updateOrder', { id, status: orderStatus });
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

  if (loading || !order) {
    return <Loading />;
  }

  const isDelivery = order.type === OrderType.DELIVERY;

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

      <div className="mx-auto max-w-[904px] space-y-6 rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Panel izquierdo - 2/3 de ancho */}
          <div className="w-full space-y-4 lg:w-2/3">
            <div>
              <h3 className="mb-2 font-semibold">Datos de Entrega</h3>
              <p className="text-sm text-gray-600">
                {order?.branch?.address ?? 'Dirección no disponible'}
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Datos del Cliente</h3>
              <p className="text-sm text-gray-600">
                <strong>Nombre:</strong>{' '}
                {order?.branch?.name ?? 'Nombre no disponible'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Teléfono:</strong>{' '}
                {order?.branch?.name ?? 'Teléfono no disponible'}
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Datos del Repartidor</h3>
              {selectedDeliveryUserId ? (
                deliveryUsers
                  .filter((user) => user.id === selectedDeliveryUserId)
                  .map((user) => (
                    <div key={user.id}>
                      <p className="text-sm text-gray-600">
                        <strong>Nombre:</strong> {user.firstName}{' '}
                        {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Teléfono:</strong>{' '}
                        {user.phoneNumber ?? 'No disponible'}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-600">
                  No hay repartidor asignado.
                </p>
              )}
            </div>
          </div>

          {/* Panel derecho - 1/3 de ancho */}
          <div className="w-full space-y-4 lg:w-1/3">
            <h3 className="mb-2 font-semibold">Productos</h3>
            <div className="space-y-2">
              {order.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-4 rounded border p-2"
                >
                  <Image
                    src={detail.productPresentation.product.images?.[0]?.url}
                    alt="Producto"
                    className="h-12 w-12 rounded object-cover"
                    width={48}
                    height={48}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {detail.productPresentation.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {detail.productPresentation.presentation.name}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-700">
                    x{detail.quantity}
                  </span>
                </div>
              ))}
              <p className="text-lg font-semibold text-gray-800">
                Total: $
                {order.details
                  .reduce((total, detail) => {
                    const price = detail.productPresentation.price || 0;
                    return total + price * detail.quantity;
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Selectores debajo en 100% */}
        <div className="mt-6 space-y-4">
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
                items={Object.values(OrderDeliveryStatus).map((statusKey) => ({
                  label: statusKey,
                  value: statusKey,
                }))}
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
      </div>
    </>
  );
}
