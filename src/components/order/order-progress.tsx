import { View } from 'react-native';

import { getOrderStepIndex, getOrderSteps } from '@/lib/order-status';
import type { Order } from '@/models/order.model';

type OrderProgressProps = {
  order: Pick<Order, 'status' | 'deliveryType'>;
};

/** Seguimiento compacto de un pedido en curso: un segmento por paso, relleno hasta el actual. */
export function OrderProgress({ order }: OrderProgressProps) {
  const steps = getOrderSteps(order);
  const current = getOrderStepIndex(order.status);

  return (
    <View
      className="flex-row gap-1"
      accessible
      accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${steps[current]}`}>
      {steps.map((step, index) => (
        <View
          key={step}
          className={`h-1 flex-1 rounded-full ${index <= current ? 'bg-accent' : 'bg-default'}`}
        />
      ))}
    </View>
  );
}
