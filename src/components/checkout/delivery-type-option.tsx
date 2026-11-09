import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { PressableFeedback, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

type DeliveryTypeOptionProps = {
  title: string;
  /** Costo o detalle: "+$2.00", "Gratis". */
  detail: string;
  icon: { ios: SFSymbol; android: AndroidSymbol };
  isSelected: boolean;
  onPress: () => void;
};

/** Opción de tipo de entrega: tarjeta con ícono, título y costo; la elegida lleva borde y check. */
export function DeliveryTypeOption({
  title,
  detail,
  icon,
  isSelected,
  onPress,
}: DeliveryTypeOptionProps) {
  const [foreground] = useThemeColor(['foreground']);
  const actionForeground = useActionForeground();

  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${title}, ${detail}`}
      className={`flex-1 gap-3 rounded-3xl border-2 bg-surface p-4 ${
        isSelected ? 'border-action' : 'border-transparent'
      }`}>
      <View className="flex-row items-start justify-between">
        <View className="size-10 items-center justify-center rounded-full bg-default">
          <SymbolView
            name={{ ios: icon.ios, android: icon.android, web: icon.android }}
            size={18}
            tintColor={foreground}
          />
        </View>
        {isSelected ? (
          <View className="size-6 items-center justify-center rounded-full bg-action">
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={12}
              weight="bold"
              tintColor={actionForeground}
            />
          </View>
        ) : (
          <View className="size-6 rounded-full border-2 border-default" />
        )}
      </View>
      <View className="gap-0.5">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted">{detail}</Text>
      </View>
    </PressableFeedback>
  );
}
