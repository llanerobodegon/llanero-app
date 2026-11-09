import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { formatUSD } from '@/lib/format';
import type { CartItem } from '@/models/cart.model';

type CartLineProps = {
  item: CartItem;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
};

/** Línea del ticket: miniatura, nombre, presentación · precio unitario y control − cantidad +. */
export function CartLine({ item, onIncrement, onDecrement }: CartLineProps) {
  const [foreground, background, muted] = useThemeColor(['foreground', 'background', 'muted']);
  const detail = item.description
    ? `${item.description} · ${formatUSD(item.unitPrice)}`
    : formatUSD(item.unitPrice);

  return (
    <View className="flex-row items-center gap-3">
      <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-default">
        {item.imageUrl ? (
          <Image
            source={item.imageUrl}
            contentFit="contain"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <SymbolView
            name={{ ios: 'photo', android: 'image', web: 'image' }}
            size={18}
            tintColor={muted}
          />
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-muted" numberOfLines={1}>
          {detail}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="secondary"
          onPress={() => onDecrement(item.productId)}
          accessibilityLabel={
            item.quantity === 1 ? `Quitar ${item.name}` : `Quitar una unidad de ${item.name}`
          }
          className="size-7 rounded-full">
          <SymbolView
            name={
              item.quantity === 1
                ? { ios: 'xmark', android: 'close', web: 'close' }
                : { ios: 'minus', android: 'remove', web: 'remove' }
            }
            size={12}
            weight="bold"
            tintColor={foreground}
          />
        </Button>
        <Text
          className="min-w-5 text-center text-sm font-semibold text-foreground"
          accessibilityLabel={`Cantidad: ${item.quantity}`}>
          {item.quantity}
        </Text>
        <Button
          isIconOnly
          size="sm"
          // Sin capa de color al presionar: en `primary` sería naranja sobre el botón negro.
          feedbackVariant="scale"
          onPress={() => onIncrement(item.productId)}
          accessibilityLabel={`Agregar una unidad de ${item.name}`}
          className="size-7 rounded-full bg-foreground">
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={12}
            weight="bold"
            tintColor={background}
          />
        </Button>
      </View>
    </View>
  );
}
