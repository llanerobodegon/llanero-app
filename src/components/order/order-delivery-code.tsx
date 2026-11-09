import { Text, View } from 'react-native';

import type { DeliveryType } from '@/models/order.model';

type OrderDeliveryCodeProps = {
  code: string;
  deliveryType: DeliveryType;
};

/** Código de 4 dígitos que el cliente muestra al recibir o retirar su pedido. */
export function OrderDeliveryCode({ code, deliveryType }: OrderDeliveryCodeProps) {
  const isDelivery = deliveryType === 'delivery';

  return (
    <View className="items-center gap-1 rounded-3xl bg-surface px-4 py-5">
      <Text className="text-sm text-muted">
        {isDelivery ? 'Código para el repartidor' : 'Código para retirar'}
      </Text>
      <Text
        className="text-4xl font-bold tracking-[10px] text-foreground"
        style={{ fontVariant: ['tabular-nums'] }}
        accessibilityLabel={`Código ${code.split('').join(' ')}`}>
        {code}
      </Text>
      <Text className="text-center text-xs text-muted">
        {isDelivery
          ? 'Dáselo al repartidor solo cuando tengas tu pedido en mano.'
          : 'Muéstralo en la tienda para retirar tu pedido.'}
      </Text>
    </View>
  );
}
