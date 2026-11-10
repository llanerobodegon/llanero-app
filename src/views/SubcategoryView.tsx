import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { EmptyState } from '@/components/empty-state';
import { SearchInput } from '@/components/form/search-input';
import { ProductGrid } from '@/components/product/product-grid';
import { ScreenHeader } from '@/components/screen-header';
import { useSubcategoryViewModel } from '@/viewmodels/useSubcategoryViewModel';

/** Subcategoría: volver, título, carrito, buscador y sus productos en 2 columnas. */
export function SubcategoryView({ subcategoryId }: { subcategoryId: string }) {
  const vm = useSubcategoryViewModel(subcategoryId);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={vm.title}
        onBack={vm.goBack}
        trailing={<CartButton count={vm.cartCount} onPress={vm.openCart} />}
      />

      <View className="px-4 pb-3 pt-1">
        <SearchInput
          value={vm.query}
          onChange={vm.setQuery}
          placeholder={vm.title ? `Buscar en ${vm.title}` : 'Buscar productos'}
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
        paddingBottom={insets.bottom + 24}
        ListEmptyComponent={
          vm.error ? (
            <EmptyState
              icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
              title="No pudimos cargar los productos"
              description={vm.error}
            />
          ) : vm.debouncedQuery ? (
            <EmptyState
              icon={{ ios: 'magnifyingglass', android: 'search' }}
              title={`Sin resultados para "${vm.debouncedQuery}"`}
              description="Prueba con otra palabra."
              actionLabel="Limpiar búsqueda"
              onPressAction={vm.clearQuery}
            />
          ) : (
            <EmptyState
              icon={{ ios: 'shippingbox', android: 'inventory_2' }}
              title="Sin productos"
              description="Esta subcategoría todavía no tiene productos en tu tienda."
              actionLabel="Volver"
              onPressAction={vm.goBack}
            />
          )
        }
      />
    </View>
  );
}
