import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

type PaymentMethodsBannerProps = {
  /** Imagen con los métodos de pago aceptados. Sin ella se muestra un placeholder. */
  source?: ImageSource | number;
  /** Proporción ancho / alto de la imagen, para mostrarla completa sin recortes. */
  aspectRatio?: number;
};

/**
 * Banner con los métodos de pago, al final del Inicio. La imagen se muestra completa, con su
 * proporción y sin fondo (trae su propia forma y fondo transparente).
 */
export function PaymentMethodsBanner({ source, aspectRatio = 2 }: PaymentMethodsBannerProps) {
  const [muted] = useThemeColor(['muted']);

  if (source) {
    return (
      <Image
        source={source}
        contentFit="contain"
        transition={200}
        style={{ width: '100%', aspectRatio }}
        accessibilityLabel="Métodos de pago: Zelle, Pago Móvil, transferencia y Banesco Panamá"
      />
    );
  }

  return (
    <View
      className="aspect-[2/1] w-full items-center justify-center gap-2 overflow-hidden rounded-3xl bg-surface"
      accessibilityRole="image"
      accessibilityLabel="Métodos de pago aceptados">
      <SymbolView
        name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
        size={32}
        tintColor={muted}
      />
      <Text className="text-sm text-muted">Métodos de pago</Text>
    </View>
  );
}
