import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { View } from 'react-native';

import { CartBadge } from './cart-badge';

type CartButtonProps = {
  /** Unidades en el carrito; se muestra como badge sobre el ícono. */
  count: number;
  onPress: () => void;
};

/** Botón redondo del carrito con su contador (barra del Inicio, Buscar). */
export function CartButton({ count, onPress }: CartButtonProps) {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View>
      <Button
        isIconOnly
        variant="tertiary"
        onPress={onPress}
        accessibilityLabel={count > 0 ? `Carrito, ${count} productos` : 'Carrito'}
        className="size-11 rounded-full bg-surface shadow-surface">
        <SymbolView
          name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
          size={22}
          tintColor={foreground}
        />
      </Button>
      <CartBadge count={count} />
    </View>
  );
}
