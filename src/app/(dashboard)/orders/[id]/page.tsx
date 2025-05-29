'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import OrderProductList from '@/components/OrderProductList';
import OrderInfoPanel from '@/components/OrderInfoPanel';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import {
  OrderStatus,
  OrderDeliveryStatus,
  OrderDetailedResponse,
  UserList,
  OrderType,
  UserRole,
} from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/app/(dashboard)/loading';
import {
  orderStatusTranslationMap,
  orderDeliveryStatusTranslationMap,
} from '@/lib/utils/orderTranslations';
import { formatPrice } from '@/lib/utils/priceFormatter';

export default function ViewOrderStatusPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token, user } = useAuth();

  const [order, setOrder] = useState<OrderDetailedResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>();
  const [deliveryStatus, setDeliveryStatus] = useState<OrderDeliveryStatus>();
  const [deliveryUsers, setDeliveryUsers] = useState<UserList[]>([]);
  const [, setDeliveryId] = useState<string | null>(null);
  const [selectedDeliveryUserId, setSelectedDeliveryUserId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);

  const fetchOrderData = useCallback(async () => {
    if (!token || !id) return;

    try {
      const orderData = await api.order.getById(id, token);
      setOrder(orderData);
      setOrderStatus(orderData.status);

      const usersRes = await api.user.findAll(
        { page: 1, limit: 100, role: UserRole.DELIVERY },
        token,
      );
      setDeliveryUsers(usersRes.results);

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

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Órdenes', href: '/orders' },
    { label: `Orden #${id.slice(0, 6)}`, href: '' },
  ];

  if (loading || !order) return <Loading />;
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
            Estado de Orden
          </h1>
          <div className="flex space-x-4">
            <Button
              color={Colors.secondaryWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="120px"
              height="48px"
              onClick={() => router.push('/orders')}
              textColor={Colors.primary}
              className="border-gray-300 hover:bg-gray-100"
            >
              Volver
            </Button>
            <Button
              color={Colors.primary}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="auto"
              onClick={() => router.push(`/orders/${id}/edit`)}
              textColor={Colors.textWhite}
            >
              Editar
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

          <div className="pointer-events-none space-y-4 rounded-xl bg-white p-6 opacity-80 shadow-md">
            <Input
              label="Estado de la Orden"
              placeholder="Estado de la orden"
              value={orderStatus ? orderStatusTranslationMap[orderStatus] : ''}
              readViewOnly
            />

            {isDelivery && deliveryStatus && (
              <>
                <Input
                  label="Estado del Delivery"
                  placeholder="Estado del delivery"
                  value={
                    deliveryStatus
                      ? orderDeliveryStatusTranslationMap[deliveryStatus]
                      : ''
                  }
                  readViewOnly
                />
                <Input
                  label="Repartidor Asignado"
                  placeholder="Repartidor asignado"
                  value={
                    deliveryUsers.find(
                      (user) => user.id === selectedDeliveryUserId,
                    )
                      ? `${deliveryUsers.find((user) => user.id === selectedDeliveryUserId)?.firstName} ${deliveryUsers.find((user) => user.id === selectedDeliveryUserId)?.lastName}`
                      : 'No asignado'
                  }
                  readViewOnly
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
