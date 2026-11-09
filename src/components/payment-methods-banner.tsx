import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

type PaymentMethodsBannerProps = {
  /** Imagen con los métodos de pago aceptados. Sin ella se muestra un placeholder. */
  source?: ImageSource | number;
};

/** Imagen 2:1 con los métodos de pago, al final del Inicio. */
export function PaymentMethodsBanner({ source }: PaymentMethodsBannerProps) {
  const [muted] = useThemeColor(['muted']);

  return (
    <View
      className="aspect-[2/1] w-full overflow-hidden rounded-3xl bg-surface"
      accessibilityRole="image"
      accessibilityLabel="Métodos de pago aceptados">
      {source ? (
        <Image source={source} contentFit="cover" style={{ width: '100%', height: '100%' }} />
      ) : (
        // TODO: pasar la imagen de métodos de pago cuando esté lista.
        <View className="flex-1 items-center justify-center gap-2">
          <SymbolView
            name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
            size={32}
            tintColor={muted}
          />
          <Text className="text-sm text-muted">Métodos de pago</Text>
        </View>
      )}
    </View>
  );
}
