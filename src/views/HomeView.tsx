import { Image } from 'expo-image';
import { useThemeColor } from 'heroui-native';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/banner-carousel';
import { CategoriesSection } from '@/components/categories-section';
import { ChangeWarehouseDialog } from '@/components/change-warehouse-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { HomeTopBar } from '@/components/home-top-bar';
import { LocationsSection } from '@/components/locations-section';
import { PaymentMethodsBanner } from '@/components/payment-methods-banner';
import { ProductSection } from '@/components/product/product-section';
import { WarehouseSelector } from '@/components/warehouse-selector';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

/** Proporción de `assets/images/llanero-logo.png` (3245 × 1046). */
const LOGO_ASPECT_RATIO = 3245 / 1046;
const LOGO_HEIGHT = 30;

export function HomeView() {
  const vm = useHomeViewModel();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="bg-background" style={styles.container}>
      {/* Logo a la izquierda y carrito a la derecha */}
      <HomeTopBar
        leading={
          <Image
            source={require('@/assets/images/llanero-logo.png')}
            contentFit="contain"
            // El vino del logo no contrasta con el fondo oscuro: ahí va en monocromo.
            tintColor={scheme === 'dark' ? foreground : undefined}
            style={{ width: LOGO_HEIGHT * LOGO_ASPECT_RATIO, height: LOGO_HEIGHT }}
            accessibilityLabel="Llanero"
          />
        }
        cartCount={vm.cartCount}
        onPressCart={vm.openCart}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        // Zona segura inferior + alto de la tabbar + aire, para que el contenido no quede bajo la barra.
        contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset + Spacing.five }}>
        {/* Tienda elegida: centrada, al inicio del contenido (se desplaza con él) */}
        <View className="items-center px-4 pt-3">
          <WarehouseSelector
            warehouses={vm.warehouses}
            selectedWarehouse={vm.selectedWarehouse}
            onSelect={vm.selectWarehouse}
            isLoading={vm.isLoadingWarehouses}
          />
        </View>

        <View style={styles.sections}>
          <BannerCarousel slides={vm.mainBanners} isLoading={vm.isLoadingMainBanners} />

          <CategoriesSection
            categories={vm.categories}
            isLoading={vm.isLoadingCategories}
            onPressCategory={vm.openCategory}
          />

          <ProductSection
            title="Promociones"
            products={vm.promotions}
            isLoading={vm.isLoadingPromotions}
            onPressProduct={vm.openProduct}
            onAddProduct={vm.addToCart}
            getCartQuantity={vm.getCartQuantity}
            onIncrementProduct={vm.incrementProduct}
            onDecrementProduct={vm.decrementProduct}
          />

          <ProductSection
            title="Populares"
            products={vm.popular}
            isLoading={vm.isLoadingPopular}
            onPressProduct={vm.openProduct}
            onAddProduct={vm.addToCart}
            getCartQuantity={vm.getCartQuantity}
            onIncrementProduct={vm.incrementProduct}
            onDecrementProduct={vm.decrementProduct}
          />

          <BannerCarousel slides={vm.secondaryBanners} isLoading={vm.isLoadingSecondaryBanners} />

          <ProductSection
            title="Mercado"
            products={vm.market}
            isLoading={vm.isLoadingMarket}
            onPressProduct={vm.openProduct}
            onAddProduct={vm.addToCart}
            getCartQuantity={vm.getCartQuantity}
            onIncrementProduct={vm.incrementProduct}
            onDecrementProduct={vm.decrementProduct}
          />

          <View style={styles.paymentMethods}>
            <PaymentMethodsBanner />
          </View>

          <LocationsSection warehouses={vm.warehouses} isLoading={vm.isLoadingWarehouses} />
        </View>
      </ScrollView>

      {/* Tienda cerrada: avisa antes de elegirla */}
      <ConfirmDialog
        isOpen={vm.closedWarehouse !== null}
        title={`${vm.closedWarehouse?.name ?? 'Esta tienda'} está cerrada`}
        description="Puedes ver sus productos, pero no podrás recibir tu pedido hasta que abra."
        confirmLabel="Elegir igual"
        onConfirm={vm.confirmClosedWarehouse}
        onCancel={vm.cancelClosedWarehouse}
      />

      <ChangeWarehouseDialog
        isOpen={vm.pendingWarehouse !== null}
        nextName={vm.pendingWarehouse?.name ?? ''}
        onConfirm={vm.confirmWarehouseChange}
        onCancel={vm.cancelWarehouseChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sections: {
    gap: Spacing.five,
    paddingTop: Spacing.three,
  },
  paymentMethods: {
    paddingHorizontal: Spacing.three,
  },
});
