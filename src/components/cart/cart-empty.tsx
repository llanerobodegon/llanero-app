import { SymbolView } from 'expo-symbols';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

/** Estado vacío dentro del ticket. */
export function CartEmpty() {
  const [muted] = useThemeColor(['muted']);

  return (
    <View className="items-center gap-2 px-6 py-8">
      <View className="size-14 items-center justify-center rounded-full bg-default">
        <SymbolView
          name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
          size={24}
          tintColor={muted}
        />
      </View>
      <Text className="text-base font-semibold text-foreground">Tu carrito está vacío</Text>
      <Text className="text-center text-sm text-muted">
        Toca el + en cualquier producto para agregarlo.
      </Text>
    </View>
  );
}
