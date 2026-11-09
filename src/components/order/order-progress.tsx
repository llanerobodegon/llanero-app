import { Text, View } from 'react-native';

import { getOrderStepIndex, getOrderSteps } from '@/lib/order-status';
import type { Order } from '@/models/order.model';

type OrderProgressProps = {
  order: Pick<Order, 'status' | 'deliveryType'>;
  /** Muestra el nombre de cada paso debajo de su segmento (vista expandida). */
  showLabels?: boolean;
};

/** Seguimiento de un pedido en curso: un segmento por paso, relleno hasta el actual. */
export function OrderProgress({ order, showLabels = false }: OrderProgressProps) {
  const steps = getOrderSteps(order);
  const current = getOrderStepIndex(order.status);

  return (
    <View
      className="flex-row gap-1.5"
      accessible
      accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${steps[current]}`}>
      {steps.map((step, index) => (
        <View key={step} className="flex-1 gap-1.5">
          <View
            className={`${showLabels ? 'h-1.5' : 'h-1'} rounded-full ${
              index <= current ? 'bg-accent' : 'bg-default'
            }`}
          />
          {showLabels ? (
            <Text
              numberOfLines={1}
              className={`text-[11px] ${
                index === current ? 'font-semibold text-foreground' : 'text-muted'
              }`}>
              {step}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
