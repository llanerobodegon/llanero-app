import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button } from 'heroui-native';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActionForeground } from '@/hooks/use-action-foreground';
import { useWelcomeViewModel } from '@/viewmodels/useWelcomeViewModel';

/**
 * Imagen de fondo de la bienvenida. Mientras no haya una definitiva se muestra un fondo
 * vinotinto con el logo; para usar una foto: `require('@/assets/images/welcome.jpg')`.
 */
const WELCOME_IMAGE: number | null = null;

/** Proporción de `assets/images/llanero-logo.png` (3245 × 1046). */
const LOGO_ASPECT_RATIO = 3245 / 1046;
const LOGO_HEIGHT = 52;

/** Bienvenida: imagen de fondo y, abajo, una tarjeta para elegir cómo ingresar. */
export function WelcomeView() {
  const vm = useWelcomeViewModel();
  const insets = useSafeAreaInsets();
  const actionForeground = useActionForeground();

  return (
    <View className="flex-1 bg-accent-secondary">
      {/* Fondo: la imagen definitiva o, por ahora, el logo en blanco sobre vinotinto */}
      {WELCOME_IMAGE ? (
        <Image
          source={WELCOME_IMAGE}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
          <Image
            source={require('@/assets/images/llanero-logo.png')}
            contentFit="contain"
            tintColor="#ffffff"
            style={{ width: LOGO_HEIGHT * LOGO_ASPECT_RATIO, height: LOGO_HEIGHT }}
            accessibilityLabel="Llanero"
          />
        </View>
      )}

      {/* Tarjeta inferior */}
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 gap-5 rounded-t-[32px] bg-background px-6 pt-7">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-foreground" accessibilityRole="header">
            Elige cómo ingresar
          </Text>
          <Text className="text-sm text-muted">
            Pide en tu bodegón favorito y recíbelo en casa.
          </Text>
        </View>

        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          onPress={vm.continueWithEmail}
          className="rounded-full bg-action">
          <SymbolView
            name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
            size={18}
            tintColor={actionForeground}
          />
          <Button.Label className="text-action-foreground">Continuar con email</Button.Label>
        </Button>

        <Text className="text-center text-xs leading-5 text-muted">
          Al continuar con email, aceptas los{' '}
          <Text
            onPress={vm.openTerms}
            accessibilityRole="link"
            className="font-semibold text-action underline">
            Términos y condiciones
          </Text>{' '}
          y la{' '}
          <Text
            onPress={vm.openPrivacy}
            accessibilityRole="link"
            className="font-semibold text-action underline">
            Política de privacidad
          </Text>{' '}
          de Llanero.
        </Text>
      </View>
    </View>
  );
}
