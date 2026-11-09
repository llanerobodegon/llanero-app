import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

type QuantityStepperProps = {
  quantity: number;
  canDecrement: boolean;
  canIncrement: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
};

/** Píldora blanca con − cantidad +. */
export function QuantityStepper({
  quantity,
  canDecrement,
  canIncrement,
  onDecrement,
  onIncrement,
}: QuantityStepperProps) {
  const [foreground] = useThemeColor(['foreground']);
  const actionForeground = useActionForeground();

  return (
    <View className="flex-row items-center gap-3 rounded-full bg-surface p-1.5 shadow-surface">
      <Button
        isIconOnly
        variant="secondary"
        onPress={onDecrement}
        isDisabled={!canDecrement}
        accessibilityLabel="Quitar una unidad"
        className="size-11 rounded-full">
        <SymbolView
          name={{ ios: 'minus', android: 'remove', web: 'remove' }}
          size={16}
          weight="bold"
          tintColor={foreground}
        />
      </Button>
      <Text
        className="min-w-8 text-center text-lg font-semibold text-foreground"
        accessibilityLabel={`Cantidad: ${quantity}`}>
        {quantity}
      </Text>
      <Button
        isIconOnly
        // Sin capa de color al presionar sobre el color de acción.
        feedbackVariant="scale"
        onPress={onIncrement}
        isDisabled={!canIncrement}
        accessibilityLabel="Agregar una unidad"
        className="size-11 rounded-full bg-action">
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          size={16}
          weight="bold"
          tintColor={actionForeground}
        />
      </Button>
    </View>
  );
}
