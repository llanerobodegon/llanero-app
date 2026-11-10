import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActionForeground } from '@/hooks/use-action-foreground';
import { useRegisteredViewModel } from '@/viewmodels/useRegisteredViewModel';

/** Proporción de `assets/images/llanero-logo.png` (3245 × 1046). */
const LOGO_ASPECT_RATIO = 3245 / 1046;
const LOGO_HEIGHT = 32;

/** Bienvenida al terminar el registro: minimalista, con el nombre y un solo botón. */
export function RegisteredView({ name }: { name: string }) {
  const vm = useRegisteredViewModel();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const [foreground] = useThemeColor(['foreground']);
  const actionForeground = useActionForeground();

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 12 }}>
      <View className="items-center">
        <Image
          source={require('@/assets/images/llanero-logo.png')}
          contentFit="contain"
          // El vino del logo no contrasta con el fondo oscuro: ahí va en monocromo.
          tintColor={scheme === 'dark' ? foreground : undefined}
          style={{ width: LOGO_HEIGHT * LOGO_ASPECT_RATIO, height: LOGO_HEIGHT }}
          accessibilityLabel="Llanero"
        />
      </View>

      <View className="flex-1 items-center justify-center gap-4">
        <View className="size-20 items-center justify-center rounded-full bg-action">
          <SymbolView
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={34}
            weight="bold"
            tintColor={actionForeground}
          />
        </View>
        <Text className="text-center text-3xl font-bold text-foreground" accessibilityRole="header">
          {name ? `¡Hola, ${name}!` : '¡Hola!'}
        </Text>
        <Text className="text-center text-base text-muted">
          Te damos la bienvenida a Llanero. Tu cuenta está lista para pedir en tu bodegón favorito.
        </Text>
      </View>

      <Button
        size="lg"
        // Sin capa de color al presionar sobre el color de acción.
        feedbackVariant="scale"
        onPress={vm.start}
        className="rounded-full bg-action">
        <Button.Label className="text-action-foreground">Empezar</Button.Label>
      </Button>
    </View>
  );
}
