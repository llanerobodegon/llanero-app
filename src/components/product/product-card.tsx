import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button, Chip, useThemeColor } from 'heroui-native';
import { Pressable, Text, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';
import { discountPercent, formatUSD } from '@/lib/format';
import type { Product } from '@/models/warehouse.model';

type ProductCardProps = {
  product: Product;
  width: number;
  onPress?: (product: Product) => void;
  onAdd?: (product: Product) => void;
  /** Unidades de este producto en el carrito; con 1 o más se muestra el selector de cantidad. */
  quantity?: number;
  onIncrement?: (product: Product) => void;
  onDecrement?: (product: Product) => void;
};

/** Tarjeta de producto: imagen, badge de descuento, nombre, presentación, precio y botón "+". */
export function ProductCard({
  product,
  width,
  onPress,
  onAdd,
  quantity = 0,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const [muted, foreground] = useThemeColor(['muted', 'foreground']);
  const actionForeground = useActionForeground();
  const imageUrl = product.imageUrls[0];
  const hasDiscount = product.isOnDiscount && product.discountPrice !== null;
  const finalPrice = hasDiscount ? product.discountPrice! : product.price;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatUSD(finalPrice)}`}
      style={{ width }}
      className="gap-3 rounded-3xl bg-surface p-3">
      <View className="aspect-square">
        {/* Imagen recortada con bordes redondeados (misma proporción en todas las tarjetas) */}
        <View className="size-full items-center justify-center overflow-hidden rounded-2xl bg-default">
          {imageUrl ? (
            <Image
              source={imageUrl}
              contentFit="cover"
              transition={200}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <SymbolView
              name={{ ios: 'photo', android: 'image', web: 'image' }}
              size={28}
              tintColor={muted}
            />
          )}
        </View>

        {hasDiscount ? (
          <Chip size="sm" variant="primary" color="accent" className="absolute left-2 top-2">
            {`${discountPercent(product.price, product.discountPrice!)}%`}
          </Chip>
        ) : null}
      </View>

      <View className="gap-0.5 px-1">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {product.name}
        </Text>
        {/* Siempre ocupa su línea (vacía si no hay descripción) para que las tarjetas midan igual */}
        <Text className="text-sm text-muted" numberOfLines={1}>
          {product.description ?? ' '}
        </Text>
      </View>

      {/* Precio: la línea del precio tachado se reserva siempre, haya descuento o no */}
      <View className="pl-1">
        <Text
          className="text-xs text-muted line-through"
          style={hasDiscount ? undefined : { opacity: 0 }}
          importantForAccessibility={hasDiscount ? 'auto' : 'no-hide-descendants'}
          accessibilityElementsHidden={!hasDiscount}>
          {formatUSD(product.price)}
        </Text>
        <Text className="text-lg font-bold text-foreground">{formatUSD(finalPrice)}</Text>
      </View>

      {/* Fila de acción, misma altura (h-10) con o sin producto en el carrito, para que todas
          las tarjetas midan igual: el "+" o el selector de cantidad. */}
      {quantity === 0 ? (
        // Solo el "+", alineado a la derecha en la misma posición que el "+" del selector.
        <View className="h-10 flex-row items-center justify-end p-1">
          <Button
            isIconOnly
            size="sm"
            // Sin capa de color al presionar sobre el color de acción.
            feedbackVariant="scale"
            onPress={() => onAdd?.(product)}
            accessibilityLabel={`Agregar ${product.name} al carrito`}
            className="size-8 rounded-full bg-action">
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={14}
              weight="semibold"
              tintColor={actionForeground}
            />
          </Button>
        </View>
      ) : (
        <View className="h-10 flex-row items-center justify-between rounded-full bg-default p-1">
          <Button
            isIconOnly
            size="sm"
            variant="tertiary"
            onPress={() => onDecrement?.(product)}
            accessibilityLabel={
              quantity === 1
                ? `Quitar ${product.name} del carrito`
                : `Quitar una unidad de ${product.name}`
            }
            className="size-8 rounded-full bg-surface">
            <SymbolView
              name={
                quantity === 1
                  ? { ios: 'xmark', android: 'close', web: 'close' }
                  : { ios: 'minus', android: 'remove', web: 'remove' }
              }
              size={14}
              weight="semibold"
              tintColor={foreground}
            />
          </Button>
          <Text
            className="text-base font-bold text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
            accessibilityLabel={`${quantity} en el carrito`}>
            {quantity}
          </Text>
          <Button
            isIconOnly
            size="sm"
            // Sin capa de color al presionar sobre el color de acción.
            feedbackVariant="scale"
            onPress={() => onIncrement?.(product)}
            accessibilityLabel={`Agregar una unidad de ${product.name}`}
            className="size-8 rounded-full bg-action">
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={14}
              weight="semibold"
              tintColor={actionForeground}
            />
          </Button>
        </View>
      )}
    </Pressable>
  );
}
