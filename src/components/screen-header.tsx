import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  /** Botón a la derecha (p. ej. el carrito), del mismo tamaño que el de volver (`size-11`). */
  trailing?: ReactNode;
};

/**
 * Barra superior de las pantallas internas: botón de volver con el mismo estilo que los
 * botones de la barra del Inicio (círculo `size-11`, `bg-surface` y sombra) y el título centrado.
 */
export function ScreenHeader({ title, onBack, trailing }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View
      className="flex-row items-center gap-3 bg-background px-4"
      style={{ paddingTop: insets.top + Spacing.two, paddingBottom: Spacing.two }}>
      <Button
        isIconOnly
        variant="tertiary"
        onPress={onBack}
        accessibilityLabel="Volver"
        className="size-11 rounded-full bg-surface shadow-surface">
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={18}
          weight="semibold"
          tintColor={foreground}
        />
      </Button>
      <Text
        className="flex-1 text-center text-lg font-semibold text-foreground"
        numberOfLines={1}
        accessibilityRole="header">
        {title}
      </Text>
      {/* A la derecha: el botón que se pase o un espacio del mismo ancho que el de volver, para
          que el título quede centrado en la pantalla */}
      {trailing ?? <View className="size-11" />}
    </View>
  );
}
