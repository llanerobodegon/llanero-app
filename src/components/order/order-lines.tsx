import { Text, View } from 'react-native';

import { formatUSD } from '@/lib/format';
import type { OrderItem } from '@/models/order.model';

/** Líneas del pedido estilo ticket: "2×  Hielo ........ $3.00". */
export function OrderLines({ items }: { items: OrderItem[] }) {
  return (
    <View className="gap-1.5">
      {items.map((item) => (
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
  );
}
