import { Chip } from 'heroui-native';

import { getOrderStatusInfo } from '@/lib/order-status';
import type { Order } from '@/models/order.model';

type OrderStatusChipProps = {
  order: Pick<Order, 'status' | 'paymentStatus' | 'deliveryType'>;
};

/** Estado del pedido como lo ve el cliente ("Verificando pago", "En camino"…). */
export function OrderStatusChip({ order }: OrderStatusChipProps) {
  const { label, color } = getOrderStatusInfo(order);
  return (
    <Chip size="sm" variant="soft" color={color}>
      {label}
    </Chip>
  );
}
