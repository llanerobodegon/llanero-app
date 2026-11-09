import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { formatTimeOfDay } from '@/lib/format';
import { getOrderStepIndex, getOrderSteps, getOrderStepTimes } from '@/lib/order-status';
import type { Order } from '@/models/order.model';

type OrderTimelineProps = {
  order: Pick<Order, 'status' | 'deliveryType' | 'createdAt' | 'confirmedAt' | 'deliveredAt'>;
};

/** Seguimiento vertical: un punto por paso, unidos por una línea, con la hora si se conoce. */
export function OrderTimeline({ order }: OrderTimelineProps) {
  const steps = getOrderSteps(order);
  const times = getOrderStepTimes(order);
  const current = getOrderStepIndex(order.status);

  return (
    <View
      accessible
      accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${steps[current]}`}>
      {steps.map((step, index) => {
        const isDone = index <= current;
        const isLast = index === steps.length - 1;
        const time = isDone ? times[index] : null;

        return (
          <View key={step} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`size-5 items-center justify-center rounded-full ${
                  isDone ? 'bg-accent' : 'bg-default'
                }`}>
                {isDone ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={10}
                    weight="bold"
                    tintColor="#ffffff"
                  />
                ) : null}
              </View>
              {!isLast ? (
                <View
                  className={`w-0.5 flex-1 ${index < current ? 'bg-accent' : 'bg-default'}`}
                  style={{ minHeight: 18 }}
                />
              ) : null}
            </View>
            <View className={`flex-1 flex-row justify-between ${isLast ? '' : 'pb-4'}`}>
              <Text
                className={`text-sm ${
                  index === current
                    ? 'font-semibold text-foreground'
                    : isDone
                      ? 'text-foreground'
                      : 'text-muted'
                }`}>
                {step}
              </Text>
              {time ? <Text className="text-xs text-muted">{formatTimeOfDay(time)}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
