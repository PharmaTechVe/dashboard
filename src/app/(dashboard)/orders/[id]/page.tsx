'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import {
  OrderStatus,
  OrderDeliveryStatus,
  OrderDetailedResponse,
} from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';

export default function ViewOrderStatusPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token } = useAuth();

  const [, setOrder] = useState<OrderDetailedResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>();
  const [deliveryStatus, setDeliveryStatus] = useState<OrderDeliveryStatus>();
  const [loading, setLoading] = useState(true);

  const fetchOrderData = useCallback(async () => {
    if (!token || typeof id !== 'string') {
      toast.error('Error');
      return;
    }

    try {
      const orderData = await api.order.getById(id, token);
      setOrder(orderData);
      setOrderStatus(orderData.status);

      const delivery = orderData.orderDeliveries?.[0];
      if (delivery) {
        setDeliveryStatus(delivery.deliveryStatus);
      }
    } catch (error) {
      console.error('Error al cargar datos de la orden:', error);
      toast.error('Error al cargar la orden o el delivery');
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

  if (loading) {
    return <p className="text-center text-[16px]">Cargando orden...</p>;
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

      <div className="mx-auto max-w-[904px] space-y-6 rounded-xl bg-white p-6 shadow-md">
        <div className="pointer-events-none opacity-80">
          <Dropdown
            title="Estado de la Orden"
            placeholder="Selecciona el estado"
            width="100%"
            selected={orderStatus}
            onChange={() => {}}
            items={Object.values(OrderStatus).map((statusKey) => ({
              label: statusKey,
              value: statusKey,
            }))}
          />
        </div>

        {deliveryStatus && (
          <div className="pointer-events-none opacity-80">
            <Dropdown
              title="Estado del Delivery"
              placeholder="Selecciona el estado del delivery"
              width="100%"
              selected={deliveryStatus}
              onChange={() => {}}
              items={Object.values(OrderDeliveryStatus).map((statusKey) => ({
                label: statusKey,
                value: statusKey,
              }))}
            />
          </div>
        )}
      </div>
    </>
  );
}
