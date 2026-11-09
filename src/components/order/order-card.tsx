import { SymbolView } from 'expo-symbols';
import { PressableFeedback, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { TicketPerforation } from '@/components/ticket-perforation';
import { formatRelativeDate, formatUSD } from '@/lib/format';
import { getOrderStatusInfo, isActiveOrder } from '@/lib/order-status';
import type { Order } from '@/models/order.model';

import { OrderProgress } from './order-progress';
import { OrderStatusChip } from './order-status-chip';

const INSET = 12;

type OrderCardProps = {
  order: Order;
  onPress: (order: Order) => void;
};

/**
 * Pedido como ticket compacto, con la misma perforación y muescas que el carrito:
 * tienda, fecha, estado (y barra de seguimiento si sigue en curso), número y total.
 * Al tocarlo se abre el detalle.
 */
export function OrderCard({ order, onPress }: OrderCardProps) {
  const [foreground, background] = useThemeColor(['foreground', 'background']);
  const isActive = isActiveOrder(order.status);
  const isDelivery = order.deliveryType === 'delivery';
  const isCancelled = order.status === 'cancelled';
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const status = getOrderStatusInfo(order);

  return (
    <PressableFeedback
      onPress={() => onPress(order)}
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${order.orderNumber} en ${order.warehouse.name}, ${status.label}, total ${formatUSD(order.totalUsd)}`}
      accessibilityHint="Abre el detalle del pedido"
      className="rounded-3xl bg-surface">
      {/* Cuerpo del ticket */}
      <View style={{ padding: INSET }} className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="size-10 items-center justify-center rounded-full bg-default">
            <SymbolView
              name={
                isDelivery
                  ? { ios: 'scooter', android: 'delivery_dining', web: 'delivery_dining' }
                  : { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }
              }
              size={18}
              tintColor={foreground}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {order.warehouse.name}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {`${formatRelativeDate(order.createdAt)} · ${units === 1 ? '1 producto' : `${units} productos`}`}
            </Text>
          </View>
          <OrderStatusChip order={order} />
        </View>

        {isActive ? <OrderProgress order={order} /> : null}
      </View>

      <TicketPerforation notchColor={background} inset={INSET} />

      {/* Talón: número y total */}
      <View style={{ padding: INSET }} className="flex-row items-center justify-between">
        <Text className="text-xs text-muted">{order.orderNumber}</Text>
        <Text
          className={`text-base font-bold ${isCancelled ? 'text-muted line-through' : 'text-foreground'}`}>
          {formatUSD(order.totalUsd)}
        </Text>
      </View>
    </PressableFeedback>
  );
}
