import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

type OrdersEmptyProps = {
  title: string;
  description: string;
  icon?: 'bag' | 'clock' | 'warning';
  actionLabel?: string;
  onPressAction?: () => void;
};

const ICONS = {
  bag: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
  clock: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
} as const;

/** Estado vacío (o de error) de la lista de pedidos, con acción opcional. */
export function OrdersEmpty({
  title,
  description,
  icon = 'bag',
  actionLabel,
  onPressAction,
}: OrdersEmptyProps) {
  const [muted] = useThemeColor(['muted']);

  return (
    <View className="items-center gap-2 px-8 py-16">
      <View className="mb-1 size-16 items-center justify-center rounded-full bg-default">
        <SymbolView name={ICONS[icon]} size={28} tintColor={muted} />
      </View>
      <Text className="text-center text-base font-semibold text-foreground">{title}</Text>
      <Text className="text-center text-sm text-muted">{description}</Text>
      {actionLabel && onPressAction ? (
        <Button
          size="md"
          feedbackVariant="scale"
          onPress={onPressAction}
          className="mt-4 rounded-full bg-foreground px-6">
          <Button.Label className="text-background">{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
