import { Text, View } from 'react-native';

import type { DeliveryItem } from '@/models/delivery.model';

/** Productos a verificar al retirar, estilo ticket y sin precios: "2×  Hielo". */
export function DeliveryItems({ items }: { items: DeliveryItem[] }) {
  return (
    <View className="gap-1.5">
      {items.map((item) => (
        <View key={item.id} className="flex-row gap-2">
          <Text
            className="w-7 text-sm font-semibold text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}>
            {`${item.quantity}×`}
          </Text>
          <Text className="flex-1 text-sm text-foreground">{item.productName}</Text>
        </View>
      ))}
    </View>
  );
}
