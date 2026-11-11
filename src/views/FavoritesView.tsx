import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { EmptyState } from '@/components/empty-state';
import { ProductGrid } from '@/components/product/product-grid';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useFavoritesViewModel } from '@/viewmodels/useFavoritesViewModel';

/** Favoritos: los productos guardados con el ♡, en 2 columnas, de la tienda elegida. */
export function FavoritesView() {
  const vm = useFavoritesViewModel();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + Spacing.two }}>
      <View className="gap-1 px-4 pb-3">
        {/* Título y carrito (mismo botón que en el Inicio) */}
        <View className="flex-row items-center justify-between">
          <Text className="pl-1 text-3xl font-bold text-foreground" accessibilityRole="header">
            Favoritos
          </Text>
          <CartButton count={vm.cartCount} onPress={vm.openCart} />
        </View>
        {vm.unavailableCount > 0 && vm.warehouseName ? (
          <Text className="pl-1 text-xs text-muted">
            {vm.unavailableCount === 1
              ? `1 favorito no está disponible en ${vm.warehouseName}.`
              : `${vm.unavailableCount} favoritos no están disponibles en ${vm.warehouseName}.`}
          </Text>
        ) : null}
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
              title="No pudimos cargar tus favoritos"
              description={vm.error}
            />
          ) : vm.hasFavorites ? (
            <EmptyState
              icon={{ ios: 'storefront', android: 'storefront' }}
              title="Tus favoritos no están en esta tienda"
              description="Cambia de tienda en Explorar para ver los productos que guardaste."
              actionLabel="Ir a Explorar"
              onPressAction={vm.goExplore}
            />
          ) : (
            <EmptyState
              icon={{ ios: 'heart', android: 'favorite_border' }}
              title="Aún no tienes favoritos"
              description="Toca el ♡ en un producto para guardarlo aquí."
              actionLabel="Ir a Explorar"
              onPressAction={vm.goExplore}
            />
          )
        }
      />
    </View>
  );
}
