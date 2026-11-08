import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICON_SIZE = 24;
const BUTTON_SIZE = 44;

type HomeTopBarProps = {
  onPressCart?: () => void;
};

/** Barra superior del Inicio: logo centrado y acceso al carrito. */
export function HomeTopBar({ onPressCart }: HomeTopBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
      {/* Mismo ancho que el botón del carrito para que el logo quede centrado */}
      <View style={styles.side} />

      {/* TODO: reemplazar por el logo de Llanero */}
      <ThemedView type="backgroundElement" style={styles.logoPlaceholder}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          LOGO
        </ThemedText>
      </ThemedView>

      <Pressable
        onPress={onPressCart}
        accessibilityRole="button"
        accessibilityLabel="Carrito"
        hitSlop={8}
        style={({ pressed }) => [styles.side, styles.cartButton, pressed && styles.pressed]}>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  side: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  logoPlaceholder: {
    width: 120,
    height: 36,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
