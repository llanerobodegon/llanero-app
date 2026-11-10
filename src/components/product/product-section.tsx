import { Skeleton } from 'heroui-native';
import { FlatList, useWindowDimensions, View } from 'react-native';

import type { Product } from '@/models/warehouse.model';

import { SectionHeader } from '../section-header';
import { ProductCard } from './product-card';

const SIDE_PADDING = 16;
const GAP = 12;
/** Tarjetas visibles por pantalla; el decimal deja asomar la siguiente. */
const VISIBLE_CARDS = 2.2;
const SKELETON_COUNT = 3;

type ProductSectionProps = {
  title: string;
  products: Product[];
  isLoading?: boolean;
  onPressSeeAll?: () => void;
  onPressProduct?: (product: Product) => void;
  onAddProduct?: (product: Product) => void;
  /** Unidades de un producto en el carrito (0 si no está). */
  getCartQuantity?: (productId: string) => number;
  onIncrementProduct?: (product: Product) => void;
  onDecrementProduct?: (product: Product) => void;
};

/**
 * Sección reutilizable del Home: título, "Ver todo" y fila horizontal de productos.
 * Si no hay productos (y no está cargando) no se muestra.
 */
export function ProductSection({
  title,
  products,
  isLoading = false,
  onPressSeeAll,
  onPressProduct,
  onAddProduct,
  getCartQuantity,
  onIncrementProduct,
  onDecrementProduct,
}: ProductSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SIDE_PADDING - GAP * 2) / VISIBLE_CARDS;

  if (!isLoading && products.length === 0) return null;

  return (
    <View className="gap-3">
      <SectionHeader title={title} onPressSeeAll={onPressSeeAll} />

      {isLoading ? (
        <View className="flex-row gap-3 px-4">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} style={{ width: cardWidth }} className="h-64 rounded-3xl" />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(product) => product.id}
          horizontal
          // Re-pinta las tarjetas cuando cambian las cantidades del carrito.
          extraData={getCartQuantity}
          showsHorizontalScrollIndicator={false}
          // Padding vertical para que la sombra de las tarjetas no se corte.
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING,
            paddingVertical: 4,
            gap: GAP,
          }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={cardWidth}
              onPress={onPressProduct}
              onAdd={onAddProduct}
              quantity={getCartQuantity?.(item.id) ?? 0}
              onIncrement={onIncrementProduct}
              onDecrement={onDecrementProduct}
            />
          )}
        />
      )}
    </View>
  );
}
