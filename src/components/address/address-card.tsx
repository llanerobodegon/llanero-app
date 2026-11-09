import { SymbolView } from 'expo-symbols';
import { Chip, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import type { Address } from '@/models/address.model';

/** Dirección guardada: ícono, nombre (con "Predeterminada" si aplica) y líneas de la dirección. */
export function AddressCard({ address }: { address: Address }) {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="flex-row items-start gap-3 rounded-3xl bg-surface p-4">
      <View className="size-10 items-center justify-center rounded-full bg-default">
        <SymbolView
          name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
          size={18}
          tintColor={foreground}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="shrink text-base font-semibold text-foreground" numberOfLines={1}>
            {address.label}
          </Text>
          {address.isDefault ? (
            <Chip size="sm" variant="soft" color="accent">
              Predeterminada
            </Chip>
          ) : null}
        </View>
        <Text className="text-sm text-muted">{address.addressLine1}</Text>
        {address.addressLine2 ? (
          <Text className="text-sm text-muted">{address.addressLine2}</Text>
        ) : null}
        <Text className="text-sm text-muted">{address.city}</Text>
      </View>
    </View>
  );
}
