import { SymbolView } from 'expo-symbols';
import { Chip, PressableFeedback, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import type { Address } from '@/models/address.model';

type AddressCardProps = {
  address: Address;
  onPress: (address: Address) => void;
};

/**
 * Dirección guardada, compacta: ícono, nombre (con "Predeterminada" si aplica), la dirección
 * en una línea y un chevron que indica que se abre para editarla.
 */
export function AddressCard({ address, onPress }: AddressCardProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const summary = [address.addressLine1, address.addressLine2, address.city]
    .filter(Boolean)
    .join(', ');

  return (
    <PressableFeedback
      onPress={() => onPress(address)}
      accessibilityRole="button"
      accessibilityLabel={`${address.label}${address.isDefault ? ', predeterminada' : ''}: ${summary}`}
      accessibilityHint="Abre la dirección para editarla"
      className="flex-row items-center gap-3 rounded-3xl bg-surface p-3">
      <View className="size-10 items-center justify-center rounded-full bg-default">
        <SymbolView
          name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
          size={18}
          tintColor={foreground}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="shrink text-sm font-semibold text-foreground" numberOfLines={1}>
            {address.label}
          </Text>
          {address.isDefault ? (
            <Chip size="sm" variant="soft" color="accent">
              Predeterminada
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
