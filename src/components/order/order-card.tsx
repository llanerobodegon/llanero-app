import { SymbolView } from 'expo-symbols';
import { LinkButton, PressableFeedback, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { TicketPerforation } from '@/components/ticket-perforation';
import { formatRelativeDate, formatUSD } from '@/lib/format';
import { getOrderStatusInfo, isActiveOrder } from '@/lib/order-status';
import type { Order } from '@/models/order.model';

import { OrderProgress } from './order-progress';
import { OrderStatusChip } from './order-status-chip';

const INSET = 12;

type OrderCardProps = {
  order: Order;
  isExpanded: boolean;
  onToggle: (order: Order) => void;
  onPressDetail?: (order: Order) => void;
};

/**
 * Pedido como ticket, con la misma perforación y muescas que el carrito.
 * Compacto: tienda, fecha, estado y total. Al tocarlo se expande con el seguimiento por pasos,
 * el código de entrega, las líneas del pedido y el desglose del total.
 */
export function OrderCard({ order, isExpanded, onToggle, onPressDetail }: OrderCardProps) {
  const [foreground, background, muted] = useThemeColor(['foreground', 'background', 'muted']);
  // Chevron que gira hacia arriba al expandir: indica que el ticket se despliega.
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg', { duration: 200 }) }],
  }));
  const isActive = isActiveOrder(order.status);
  const isDelivery = order.deliveryType === 'delivery';
  const isCancelled = order.status === 'cancelled';
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const status = getOrderStatusInfo(order);

  return (
    <PressableFeedback
      onPress={() => onToggle(order)}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      accessibilityLabel={`Pedido ${order.orderNumber} en ${order.warehouse.name}, ${status.label}, total ${formatUSD(order.totalUsd)}`}
      accessibilityHint={isExpanded ? 'Toca para contraer' : 'Toca para ver más'}
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

        {isActive ? <OrderProgress order={order} showLabels={isExpanded} /> : null}

        {isExpanded ? (
          <Animated.View entering={FadeIn.duration(180)} className="gap-3">
            {isActive ? (
              <View className="flex-row items-center justify-between rounded-xl bg-default px-3 py-2.5">
                <Text className="flex-1 text-xs text-muted">
                  {isDelivery ? 'Código para el repartidor' : 'Código para retirar'}
                </Text>
                <Text
                  className="text-lg font-bold tracking-[4px] text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                  accessibilityLabel={`Código ${order.deliveryCode.split('').join(' ')}`}>
                  {order.deliveryCode}
                </Text>
              </View>
            ) : null}

            {isCancelled && order.cancellationReason ? (
              <Text className="text-xs text-danger">{order.cancellationReason}</Text>
            ) : null}

            <View className="gap-1.5">
              {order.items.map((item) => (
                <View key={item.id} className="flex-row gap-2">
                  <Text
                    className="w-7 text-sm font-semibold text-foreground"
                    style={{ fontVariant: ['tabular-nums'] }}>
                    {`${item.quantity}×`}
                  </Text>
                  <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text className="text-sm text-muted">{formatUSD(item.totalUsd)}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}
      </View>

      <TicketPerforation notchColor={background} inset={INSET} />

      {/* Talón: desglose (expandido) y total */}
      <View style={{ padding: INSET }} className="gap-1">
        {isExpanded ? (
          <Animated.View entering={FadeIn.duration(180)} className="gap-1">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">{`Productos (${units})`}</Text>
              <Text className="text-sm text-muted">{formatUSD(order.subtotalUsd)}</Text>
            </View>
            {isDelivery ? (
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Delivery</Text>
                <Text className="text-sm text-muted">{formatUSD(order.deliveryFeeUsd)}</Text>
              </View>
            ) : null}
          </Animated.View>
        ) : null}

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted">{order.orderNumber}</Text>
          <Text
            className={`text-base font-bold ${isCancelled ? 'text-muted line-through' : 'text-foreground'}`}>
            {formatUSD(order.totalUsd)}
          </Text>
        </View>

        {isExpanded && onPressDetail ? (
          <LinkButton
            onPress={() => onPressDetail(order)}
            accessibilityLabel={`Ver detalle del pedido ${order.orderNumber}`}
            className="mt-1 self-center">
            <LinkButton.Label className="text-accent">Ver detalle</LinkButton.Label>
          </LinkButton>
        ) : null}

        <Animated.View
          style={chevronStyle}
          className="self-center"
          importantForAccessibility="no-hide-descendants">
          <SymbolView
            name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
            size={14}
            weight="semibold"
            tintColor={muted}
          />
        </Animated.View>
      </View>
    </PressableFeedback>
  );
}
