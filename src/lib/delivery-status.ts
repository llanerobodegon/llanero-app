import type { OrderStatusColor } from '@/lib/order-status';
import type { OrderStatus } from '@/models/order.model';

/** Estado de una entrega como lo entiende el repartidor. */
export function getDeliveryStatusInfo(status: OrderStatus): {
  label: string;
  color: OrderStatusColor;
} {
  switch (status) {
    case 'pending':
      return { label: 'Esperando pago', color: 'warning' };
    case 'confirmed':
      return { label: 'Por retirar', color: 'accent' };
    case 'on_delivery':
      return { label: 'En camino', color: 'accent' };
    case 'completed':
      return { label: 'Entregado', color: 'success' };
    case 'cancelled':
      return { label: 'Cancelado', color: 'danger' };
    default:
      return { label: status, color: 'default' };
  }
}

/** Qué le toca hacer al repartidor en cada estado, en una línea. */
export function getDeliveryStatusDescription(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'El bodegón todavía está verificando el pago. Te avisaremos cuando puedas retirarlo.';
    case 'confirmed':
      return 'Retira el pedido en el bodegón y revisa que estén todos los productos.';
    case 'on_delivery':
      return 'Lleva el pedido al cliente y pídele su código de 4 dígitos al entregarlo.';
    case 'completed':
      return 'Entregaste este pedido.';
    case 'cancelled':
      return 'Este pedido fue cancelado.';
    default:
      return '';
  }
}
