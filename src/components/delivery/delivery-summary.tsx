import { Text, View } from 'react-native';

import type { DeliverySummary as Summary } from '@/models/delivery.model';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-3xl bg-surface p-4">
      <Text
        className="text-3xl font-bold text-foreground"
        style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text className="text-sm text-muted">{label}</Text>
    </View>
  );
}

/** Resumen del historial: entregas de hoy y de los últimos 7 días. */
export function DeliverySummary({ summary }: { summary: Summary }) {
  return (
    <View
      className="flex-row gap-2.5"
      accessibilityLabel={`${summary.today} entregas hoy, ${summary.last7Days} en los últimos 7 días`}>
      <Stat value={summary.today} label="Hoy" />
      <Stat value={summary.last7Days} label="Últimos 7 días" />
    </View>
  );
}
