import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

type HomeTopBarProps = {
  /** Contenido alineado a la izquierda (p. ej. el selector de tienda). */
  leading?: ReactNode;
  onPressCart?: () => void;
};

/** Barra superior del Inicio: contenido a la izquierda y acceso al carrito a la derecha. */
export function HomeTopBar({ leading, onPressCart }: HomeTopBarProps) {
  const insets = useSafeAreaInsets();
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View
      className="bg-background"
      style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.leading}>{leading}</View>

      {/* Mismo alto (h-11), fondo y sombra que el pill de la tienda */}
      <Button
        isIconOnly
        variant="tertiary"
        onPress={onPressCart}
        accessibilityLabel="Carrito"
        className="size-11 rounded-full bg-surface shadow-surface">
        <SymbolView
          name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
          size={22}
          tintColor={foreground}
        />
      </Button>
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
