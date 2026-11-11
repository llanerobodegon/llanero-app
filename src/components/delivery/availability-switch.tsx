import { Switch, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { useActionColor } from '@/hooks/use-action-foreground';
import type { DeliveryAvailability } from '@/models/delivery.model';

const COPY: Record<DeliveryAvailability, { title: string; subtitle: string }> = {
  available: { title: 'Disponible', subtitle: 'Puedes recibir pedidos' },
  unavailable: { title: 'No disponible', subtitle: 'No te asignarán pedidos' },
  on_delivery: { title: 'En entrega', subtitle: 'Tienes un pedido en camino' },
};

type AvailabilitySwitchProps = {
  availability: DeliveryAvailability;
  isUpdating: boolean;
  onToggle: () => void;
};

/**
 * Disponibilidad del repartidor. El bodegón solo puede asignar pedidos a quien está
 * disponible; con un pedido en camino queda "En entrega" y no se puede apagar.
 */
export function AvailabilitySwitch({ availability, isUpdating, onToggle }: AvailabilitySwitchProps) {
  const [defaultColor] = useThemeColor(['default']);
  const actionColor = useActionColor();
  const { title, subtitle } = COPY[availability];

  return (
    <View className="flex-row items-center gap-3 rounded-3xl bg-surface p-4">
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>
      <Switch
        isSelected={availability !== 'unavailable'}
        onSelectedChange={onToggle}
        isDisabled={isUpdating || availability === 'on_delivery'}
        accessibilityLabel="Disponible para recibir pedidos"
        // Mismo color de acción que el interruptor de notificaciones.
        animation={{ backgroundColor: { value: [defaultColor, actionColor] } }}
      />
    </View>
  );
}
