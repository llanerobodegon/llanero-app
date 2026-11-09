import { SymbolView } from 'expo-symbols';
import { Chip, PressableFeedback, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import type { SavedPaymentMethod } from '@/models/payment-method.model';

type PaymentMethodCardProps = {
  method: SavedPaymentMethod;
  onPress: (method: SavedPaymentMethod) => void;
};

/**
 * Método de pago guardado, compacto (igual que las direcciones): ícono, alias (con
 * "Predeterminado" si aplica), banco y teléfono, y un chevron para editarlo.
 */
export function PaymentMethodCard({ method, onPress }: PaymentMethodCardProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const summary = `${method.bank} · ${method.phoneCode}-${method.phoneNumber}`;

  return (
    <PressableFeedback
      onPress={() => onPress(method)}
      accessibilityRole="button"
      accessibilityLabel={`${method.alias}${method.isDefault ? ', predeterminado' : ''}: Pago Móvil, ${summary}`}
      accessibilityHint="Abre el método de pago para editarlo"
      className="flex-row items-center gap-3 rounded-3xl bg-surface p-3">
      <View className="size-10 items-center justify-center rounded-full bg-default">
        <SymbolView
          name={{ ios: 'iphone', android: 'smartphone', web: 'smartphone' }}
          size={18}
          tintColor={foreground}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="shrink text-sm font-semibold text-foreground" numberOfLines={1}>
            {method.alias}
          </Text>
          {method.isDefault ? (
            <Chip size="sm" variant="soft" color="accent">
              Predeterminado
            </Chip>
          ) : null}
        </View>
        <Text className="text-xs text-muted" numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={14}
        weight="semibold"
        tintColor={muted}
      />
    </PressableFeedback>
  );
}
