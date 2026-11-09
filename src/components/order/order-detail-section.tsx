import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type OrderDetailSectionProps = {
  title: string;
  children: ReactNode;
};

/** Bloque del detalle del pedido: título pequeño y tarjeta con el contenido. */
export function OrderDetailSection({ title, children }: OrderDetailSectionProps) {
  return (
    <View className="gap-2">
      <Text className="pl-1 text-sm font-semibold text-muted" accessibilityRole="header">
        {title}
      </Text>
      <View className="gap-3 rounded-3xl bg-surface p-4">{children}</View>
    </View>
  );
}

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

/** Fila etiqueta / valor dentro de una sección. */
export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-sm text-muted">{label}</Text>
      {typeof value === 'string' ? (
        <Text className="shrink text-right text-sm font-medium text-foreground">{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}
