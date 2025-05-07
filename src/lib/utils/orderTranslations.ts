import { OrderStatus, OrderDeliveryStatus } from '@pharmatech/sdk';

export const orderStatusTranslationMap: Record<OrderStatus, string> = {
  [OrderStatus.REQUESTED]: 'Solicitado',
  [OrderStatus.IN_PROGRESS]: 'En proceso',
  [OrderStatus.APPROVED]: 'Aprobada',
  [OrderStatus.CANCELED]: 'Cancelada',
  [OrderStatus.READY_FOR_PICKUP]: 'Lista para Retiro',
  [OrderStatus.COMPLETED]: 'Completado',
};

export const orderDeliveryStatusTranslationMap: Record<
  OrderDeliveryStatus,
  string
> = {
  [OrderDeliveryStatus.PAYMENT_PENDING]: 'Pago pendiente',
  [OrderDeliveryStatus.PAYMENT_VALIDATED]: 'Pago validado',
  [OrderDeliveryStatus.TO_ASSIGN]: 'Por asignar',
  [OrderDeliveryStatus.ASSIGNED]: 'Asignada',
  [OrderDeliveryStatus.PICKED_UP]: 'Retirada por el repartidor',
  [OrderDeliveryStatus.WAITING_CONFIRMATION]: 'Esperando confirmación',
  [OrderDeliveryStatus.IN_ROUTE]: 'En ruta',
  [OrderDeliveryStatus.DELIVERED]: 'Entregada',
};
