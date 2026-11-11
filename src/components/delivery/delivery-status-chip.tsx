import { Chip } from 'heroui-native';

import { getDeliveryStatusInfo } from '@/lib/delivery-status';
import type { OrderStatus } from '@/models/order.model';

/** Estado de la entrega como lo ve el repartidor ("Por retirar", "En camino"…). */
export function DeliveryStatusChip({ status }: { status: OrderStatus }) {
  const { label, color } = getDeliveryStatusInfo(status);
  return (
    <Chip size="sm" variant="soft" color={color}>
      {label}
    </Chip>
  );
}
