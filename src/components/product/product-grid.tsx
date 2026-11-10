import { Skeleton } from 'heroui-native';
import type { ReactElement } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';

import type { Product } from '@/models/warehouse.model';

import { ProductCard } from './product-card';

const SIDE_PADDING = 16;
const GAP = 12;
const COLUMNS = 2;
const SKELETON_COUNT = 6;

type ProductGridProps = {
  products: Product[];
  isLoading?: boolean;
  getCartQuantity: (productId: string) => number;
  onPressProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onIncrementProduct: (product: Product) => void;
  onDecrementProduct: (product: Product) => void;
  /** Estado vacío (o de error) cuando no hay productos. */
  ListEmptyComponent?: ReactElement;
  /** Aire al final (p. ej. zona segura + tabbar). */
  paddingBottom: number;
};

/** Productos en 2 columnas con las tarjetas del Inicio (Buscar, subcategoría). */
export function ProductGrid({
  products,
  isLoading = false,
  getCartQuantity,
  onPressProduct,
  onAddProduct,
  onIncrementProduct,
  onDecrementProduct,
  ListEmptyComponent,
  paddingBottom,
}: ProductGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SIDE_PADDING * 2 - GAP) / COLUMNS;

  if (isLoading) {
    return (
      <View className="flex-row flex-wrap px-4" style={{ gap: GAP }}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <Skeleton key={index} style={{ width: cardWidth }} className="h-72 rounded-3xl" />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(product) => product.id}
      numColumns={COLUMNS}
      // Re-pinta las tarjetas cuando cambian las cantidades del carrito.
      extraData={getCartQuantity}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{
        gap: GAP,
        paddingHorizontal: SIDE_PADDING,
        paddingTop: 4,
        paddingBottom,
      }}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={cardWidth}
          onPress={onPressProduct}
          onAdd={onAddProduct}
          quantity={getCartQuantity(item.id)}
          onIncrement={onIncrementProduct}
          onDecrement={onDecrementProduct}
        />
      )}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}
