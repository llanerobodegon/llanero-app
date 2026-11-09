import { SymbolView } from 'expo-symbols';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

/** Aviso de que la promoción es limitada. */
export function PromoNotice() {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-warning/15 px-4 py-3">
      <SymbolView
        name={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
        size={20}
        tintColor={foreground}
      />
      <Text className="flex-1 text-sm text-foreground">
        Esta promoción es limitada y puede cambiar en cualquier momento según la disponibilidad del
        producto.
      </Text>
    </View>
  );
}
