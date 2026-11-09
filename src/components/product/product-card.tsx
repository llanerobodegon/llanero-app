import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button, Chip, useThemeColor } from 'heroui-native';
import { Pressable, Text, View } from 'react-native';

import { discountPercent, formatUSD } from '@/lib/format';
import type { Product } from '@/models/warehouse.model';

type ProductCardProps = {
  product: Product;
  width: number;
  onPress?: (product: Product) => void;
  onAdd?: (product: Product) => void;
};

/** Tarjeta de producto: imagen, badge de descuento, nombre, presentación, precio y botón "+". */
export function ProductCard({ product, width, onPress, onAdd }: ProductCardProps) {
  const [background, muted] = useThemeColor(['background', 'muted']);
  const imageUrl = product.imageUrls[0];
  const hasDiscount = product.isOnDiscount && product.discountPrice !== null;
  const finalPrice = hasDiscount ? product.discountPrice! : product.price;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatUSD(finalPrice)}`}
      style={{ width }}
      className="gap-3 rounded-3xl bg-surface p-3 shadow-surface">
      <View className="aspect-square items-center justify-center">
        {imageUrl ? (
          <Image
            source={imageUrl}
            contentFit="contain"
            transition={200}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          // TODO: quitar el placeholder cuando los productos vengan de Supabase con imagen.
          <View className="size-full items-center justify-center rounded-2xl bg-default">
            <SymbolView
              name={{ ios: 'photo', android: 'image', web: 'image' }}
              size={28}
              tintColor={muted}
            />
          </View>
        )}

        {hasDiscount ? (
          <Chip size="sm" variant="primary" color="accent" className="absolute left-0 top-0">
            {`${discountPercent(product.price, product.discountPrice!)}%`}
          </Chip>
        ) : null}
      </View>

      <View className="gap-0.5 px-1">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {product.name}
        </Text>
        {product.description ? (
          <Text className="text-sm text-muted" numberOfLines={1}>
            {product.description}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-end justify-between gap-2 pl-1">
        <View className="shrink">
          {hasDiscount ? (
            <Text className="text-xs text-muted line-through">{formatUSD(product.price)}</Text>
          ) : null}
          <Text className="text-lg font-bold text-foreground">{formatUSD(finalPrice)}</Text>
        </View>

        <Button
          isIconOnly
          size="sm"
          // Sin capa de color al presionar: en `primary` sería naranja sobre el botón negro.
          feedbackVariant="scale"
          onPress={() => onAdd?.(product)}
          accessibilityLabel={`Agregar ${product.name} al carrito`}
          className="rounded-full bg-foreground">
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={18}
            tintColor={background}
          />
        </Button>
      </View>
    </Pressable>
  );
}
