import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  /** Ícono en el círculo gris: SF Symbol en iOS y Material Symbol en Android/web. */
  icon: { ios: SFSymbol; android: AndroidSymbol };
  title: string;
  description: string;
  actionLabel?: string;
  onPressAction?: () => void;
  /** Ajustes de espaciado para contenedores pequeños (p. ej. el ticket del carrito). */
  className?: string;
};

/**
 * Estado vacío (o de error) de la app: ícono en círculo gris, título, descripción y botón
 * negro opcional. Úsalo en todas las listas vacías para que se vean igual.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onPressAction,
  className = 'py-16',
}: EmptyStateProps) {
  const [muted] = useThemeColor(['muted']);

  return (
    <View className={`items-center gap-2 px-8 ${className}`}>
      <View className="mb-1 size-16 items-center justify-center rounded-full bg-default">
        <SymbolView
          name={{ ios: icon.ios, android: icon.android, web: icon.android }}
          size={28}
          tintColor={muted}
        />
      </View>
      <Text className="text-center text-base font-semibold text-foreground">{title}</Text>
      <Text className="text-center text-sm text-muted">{description}</Text>
      {actionLabel && onPressAction ? (
        <Button
          size="md"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          onPress={onPressAction}
          className="mt-4 rounded-full bg-action px-6">
          <Button.Label className="text-action-foreground">{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
