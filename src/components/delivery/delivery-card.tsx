import { SymbolView } from 'expo-symbols';
import { PressableFeedback, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { TicketPerforation } from '@/components/ticket-perforation';
import { formatDateTime, formatRelativeDate } from '@/lib/format';
import { getDeliveryStatusInfo } from '@/lib/delivery-status';
import type { DeliveryListItem } from '@/models/delivery.model';

import { DeliveryStatusChip } from './delivery-status-chip';

const INSET = 12;

type DeliveryCardProps = {
  delivery: DeliveryListItem;
  onPress: (delivery: DeliveryListItem) => void;
};

/**
 * Entrega como ticket compacto, igual que la tarjeta de pedido del cliente pero sin montos:
 * cliente, destino y estado arriba; número, bodegón y productos en el talón.
 */
export function DeliveryCard({ delivery, onPress }: DeliveryCardProps) {
  const [foreground, background] = useThemeColor(['foreground', 'background']);
  const destination = [delivery.addressLine1, delivery.city].filter(Boolean).join(', ');
  const units = delivery.itemCount === 1 ? '1 producto' : `${delivery.itemCount} productos`;
  const status = getDeliveryStatusInfo(delivery.status);
  const date = delivery.deliveredAt
    ? `Entregado ${formatDateTime(delivery.deliveredAt)}`
    : `Asignado ${formatRelativeDate(delivery.createdAt)}`;

  return (
    <PressableFeedback
      onPress={() => onPress(delivery)}
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${delivery.orderNumber} para ${delivery.customerName}, ${status.label}`}
      accessibilityHint="Abre el detalle de la entrega"
      className="rounded-3xl bg-surface">
      <View style={{ padding: INSET }} className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="size-10 items-center justify-center rounded-full bg-default">
            <SymbolView
              name={{ ios: 'scooter', android: 'delivery_dining', web: 'delivery_dining' }}
              size={18}
              tintColor={foreground}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {delivery.customerName || 'Cliente'}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {destination || 'Sin dirección'}
            </Text>
          </View>
          <DeliveryStatusChip status={delivery.status} />
        </View>
        <Text className="text-xs text-muted" numberOfLines={1}>
          {`${delivery.warehouseName} · ${units}`}
        </Text>
      </View>

      <TicketPerforation notchColor={background} inset={INSET} />

      <View style={{ padding: INSET }} className="flex-row items-center justify-between gap-3">
        <Text className="text-xs text-muted">{delivery.orderNumber}</Text>
        <Text className="shrink text-right text-xs text-muted" numberOfLines={1}>
          {date}
        </Text>
      </View>
    </PressableFeedback>
  );
}
