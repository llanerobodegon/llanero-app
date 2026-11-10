import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { Spacing } from '@/constants/theme';

type HomeTopBarProps = {
  /** Contenido alineado a la izquierda (p. ej. el selector de tienda). */
  leading?: ReactNode;
  /** Unidades en el carrito; se muestra como badge sobre el ícono. */
  cartCount?: number;
  onPressCart?: () => void;
};

/** Barra superior del Inicio: contenido a la izquierda y acceso al carrito a la derecha. */
export function HomeTopBar({ leading, cartCount = 0, onPressCart }: HomeTopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background"
      style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.leading}>{leading}</View>

      {/* Mismo alto (h-11), fondo y sombra que el pill de la tienda */}
      <CartButton count={cartCount} onPress={() => onPressCart?.()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  leading: {
    flex: 1,
    alignItems: 'flex-start',
  },
});
