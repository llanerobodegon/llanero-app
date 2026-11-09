import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICON_SIZE = 24;
const BUTTON_SIZE = 44;

type HomeTopBarProps = {
  /** Contenido alineado a la izquierda (p. ej. el selector de tienda). */
  leading?: ReactNode;
  onPressCart?: () => void;
};

/** Barra superior del Inicio: contenido a la izquierda y acceso al carrito a la derecha. */
export function HomeTopBar({ leading, onPressCart }: HomeTopBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.leading}>{leading}</View>

      <Pressable
        onPress={onPressCart}
        accessibilityRole="button"
        accessibilityLabel="Carrito"
        hitSlop={8}
        style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
          size={ICON_SIZE}
          tintColor={theme.text}
        />
      </Pressable>
    </ThemedView>
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
  cartButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
