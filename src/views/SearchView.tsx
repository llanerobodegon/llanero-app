import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { EmptyState } from '@/components/empty-state';
import { SearchInput } from '@/components/form/search-input';
import { ProductGrid } from '@/components/product/product-grid';
import { SubcategoryChips } from '@/components/subcategory-chips';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useSearchViewModel } from '@/viewmodels/useSearchViewModel';

/** Buscar: buscador, subcategorías en una fila y productos en 2 columnas. */
export function SearchView() {
  const vm = useSearchViewModel();
  const insets = useSafeAreaInsets();

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
          <SearchInput
            value={vm.query}
            onChange={vm.setQuery}
            placeholder={vm.warehouseName ? `Buscar en ${vm.warehouseName}` : 'Buscar productos'}
          />
        </View>

        <SubcategoryChips
          subcategories={vm.subcategories}
          selectedId={vm.selectedSubcategoryId}
          onSelect={vm.selectSubcategory}
          isLoading={vm.isLoadingSubcategories}
        />
      </View>

      <ProductGrid
        products={vm.products}
        isLoading={vm.isLoading}
        getCartQuantity={vm.getCartQuantity}
        onPressProduct={vm.openProduct}
        onAddProduct={vm.addToCart}
        onIncrementProduct={vm.incrementProduct}
        onDecrementProduct={vm.decrementProduct}
        // Zona segura inferior + alto de la tabbar + aire, para que nada quede bajo la barra.
        paddingBottom={insets.bottom + BottomTabInset + Spacing.five}
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
    </View>
  );
}
