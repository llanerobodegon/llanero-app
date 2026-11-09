import type { Order, OrderStatus } from '@/models/order.model';

/** Colores de `Chip` de HeroUI Native que usa el estado del pedido. */
export type OrderStatusColor = 'accent' | 'success' | 'warning' | 'danger' | 'default';

/** Pedidos que el cliente sigue esperando (pestaña "En curso"). */
export function isActiveOrder(status: OrderStatus): boolean {
  return status === 'pending' || status === 'confirmed' || status === 'on_delivery';
}

/**
 * Estado del pedido como lo entiende el cliente. Combina `status`, `paymentStatus` y el tipo
 * de entrega: un pedido `pending` está esperando que se verifique el pago, y `on_delivery`
 * en un retiro significa que ya se puede pasar buscando.
 */
export function getOrderStatusInfo(
  order: Pick<Order, 'status' | 'paymentStatus' | 'deliveryType'>,
): { label: string; color: OrderStatusColor } {
  const isPickup = order.deliveryType === 'pickup';
  switch (order.status) {
    case 'pending':
      return order.paymentStatus === 'rejected'
        ? { label: 'Pago rechazado', color: 'danger' }
        : { label: 'Verificando pago', color: 'warning' };
    case 'confirmed':
      return { label: 'Preparando', color: 'accent' };
    case 'on_delivery':
      return { label: isPickup ? 'Listo para retirar' : 'En camino', color: 'accent' };
    case 'completed':
      return { label: isPickup ? 'Retirado' : 'Entregado', color: 'success' };
    case 'cancelled':
      return { label: 'Cancelado', color: 'danger' };
    default:
      return { label: order.status, color: 'default' };
  }
}

/** Pasos del seguimiento de un pedido en curso. */
export function getOrderSteps(order: Pick<Order, 'deliveryType'>): string[] {
  return order.deliveryType === 'pickup'
    ? ['Recibido', 'Preparando', 'Listo', 'Retirado']
    : ['Recibido', 'Preparando', 'En camino', 'Entregado'];
}

/** Índice del paso actual en `getOrderSteps` (0 = recibido). */
export function getOrderStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'confirmed':
      return 1;
    case 'on_delivery':
      return 2;
    case 'completed':
      return 3;
    default:
      return 0;
  }
}
