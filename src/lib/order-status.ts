import type { Order, OrderStatus, PaymentMethodType, PaymentStatus } from '@/models/order.model';

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
      return {
        label: isPickup ? 'Listo para retirar' : 'En camino',
        color: 'accent',
      };
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

/** Explicación de una línea del estado actual, para el detalle del pedido. */
export function getOrderStatusDescription(
  order: Pick<Order, 'status' | 'paymentStatus' | 'deliveryType'>,
): string {
  const isPickup = order.deliveryType === 'pickup';
  switch (order.status) {
    case 'pending':
      return order.paymentStatus === 'rejected'
        ? 'No pudimos verificar tu pago. Revisa los datos de tu pago o contacta a la tienda.'
        : 'Recibimos tu pedido. Estamos verificando tu pago y te avisaremos al confirmarlo.';
    case 'confirmed':
      return 'Tu pago fue verificado y estamos preparando tu pedido.';
    case 'on_delivery':
      return isPickup
        ? 'Tu pedido está listo. Pasa por la tienda y muestra tu código para retirarlo.'
        : 'Tu pedido va en camino. Dale tu código al repartidor cuando llegue.';
    case 'completed':
      return isPickup
        ? 'Retiraste tu pedido. ¡Gracias por comprar!'
        : 'Tu pedido fue entregado. ¡Gracias por comprar!';
    case 'cancelled':
      return 'Este pedido fue cancelado.';
    default:
      return '';
  }
}

/** Hora en que se alcanzó cada paso de `getOrderSteps`, si la base la guarda. */
export function getOrderStepTimes(
  order: Pick<Order, 'createdAt' | 'confirmedAt' | 'deliveredAt'>,
): (string | null)[] {
  // `on_delivery` no tiene columna de fecha propia.
  return [order.createdAt, order.confirmedAt, null, order.deliveredAt];
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
  zelle: 'Zelle',
  banesco_panama: 'Banesco Panamá',
};

export function getPaymentMethodLabel(type: PaymentMethodType): string {
  return PAYMENT_METHOD_LABELS[type] ?? type;
}

export function getPaymentStatusInfo(status: PaymentStatus): {
  label: string;
  color: OrderStatusColor;
} {
  switch (status) {
    case 'verified':
      return { label: 'Verificado', color: 'success' };
    case 'rejected':
      return { label: 'Rechazado', color: 'danger' };
    default:
      return { label: 'Por verificar', color: 'warning' };
  }
}
