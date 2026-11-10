import { SearchField, Skeleton } from 'heroui-native';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { EmptyState } from '@/components/empty-state';
import { ACTION_FOCUS, NO_SHADOW } from '@/components/form/form-input';
import { ProductCard } from '@/components/product/product-card';
import { SubcategoryChips } from '@/components/subcategory-chips';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useSearchViewModel } from '@/viewmodels/useSearchViewModel';

const SIDE_PADDING = 16;
const GAP = 12;
const COLUMNS = 2;
const SKELETON_COUNT = 6;

/** Buscar: buscador, subcategorías en una fila y productos en 2 columnas. */
export function SearchView() {
  const vm = useSearchViewModel();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SIDE_PADDING * 2 - GAP) / COLUMNS;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + Spacing.two }}>
      <View className="gap-3 pb-3">
        {/* Título y carrito (mismo botón que en el Inicio) */}
        <View className="flex-row items-center justify-between px-4">
          <Text className="pl-1 text-3xl font-bold text-foreground" accessibilityRole="header">
            Buscar
          </Text>
          <CartButton count={vm.cartCount} onPress={vm.openCart} />
        </View>

        <View className="px-4">
          <SearchField value={vm.query} onChange={vm.setQuery}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder={
                  vm.warehouseName ? `Buscar en ${vm.warehouseName}` : 'Buscar productos'
                }
                className={`${NO_SHADOW} ${ACTION_FOCUS}`}
                selectionColorClassName="accent-action"
                autoCorrect={false}
                returnKeyType="search"
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </View>

        <SubcategoryChips
          subcategories={vm.subcategories}
          selectedId={vm.selectedSubcategoryId}
          onSelect={vm.selectSubcategory}
          isLoading={vm.isLoadingSubcategories}
        />
      </View>

      {vm.isLoading ? (
        <View className="flex-row flex-wrap px-4" style={{ gap: GAP }}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} style={{ width: cardWidth }} className="h-72 rounded-3xl" />
          ))}
        </View>
      ) : (
        <FlatList
          data={vm.products}
          keyExtractor={(product) => product.id}
          numColumns={COLUMNS}
          // Re-pinta las tarjetas cuando cambian las cantidades del carrito.
          extraData={vm.getCartQuantity}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{
            gap: GAP,
            paddingHorizontal: SIDE_PADDING,
            paddingTop: Spacing.one,
            // Zona segura inferior + alto de la tabbar + aire, para que nada quede bajo la barra.
            paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
          }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={cardWidth}
              onPress={vm.openProduct}
              onAdd={vm.addToCart}
              quantity={vm.getCartQuantity(item.id)}
              onIncrement={vm.incrementProduct}
              onDecrement={vm.decrementProduct}
            />
          )}
          ListEmptyComponent={
            vm.error ? (
              <EmptyState
                icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
                title="No pudimos buscar"
                description={vm.error}
              />
            ) : (
              <EmptyState
                icon={{ ios: 'magnifyingglass', android: 'search' }}
                title={
                  vm.debouncedQuery ? `Sin resultados para "${vm.debouncedQuery}"` : 'Sin productos'
                }
                description="Prueba con otra palabra o quita el filtro de subcategoría."
                actionLabel={vm.hasFilters ? 'Limpiar búsqueda' : undefined}
                onPressAction={vm.hasFilters ? vm.clearFilters : undefined}
              />
            )
          }
        />
      )}
    </View>
  );
}
