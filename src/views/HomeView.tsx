import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/banner-carousel';
import { CategoriesSection } from '@/components/categories-section';
import { CategoryFilterBar } from '@/components/category-filter-bar';
import { HomeTopBar } from '@/components/home-top-bar';
import { LocationsSection } from '@/components/locations-section';
import { PaymentMethodsBanner } from '@/components/payment-methods-banner';
import { ProductSection } from '@/components/product/product-section';
import { WarehouseSelector } from '@/components/warehouse-selector';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

export function HomeView() {
  const vm = useHomeViewModel();
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background" style={styles.container}>
      {/* TODO: abrir el carrito cuando exista su pantalla */}
      <HomeTopBar
        leading={
          <WarehouseSelector
            warehouses={vm.warehouses}
            selectedWarehouse={vm.selectedWarehouse}
            onSelect={vm.selectWarehouse}
            isLoading={vm.isLoadingWarehouses}
          />
        }
        onPressCart={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        // Zona segura inferior + alto de la tabbar + aire, para que el contenido no quede bajo la barra.
        contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset + Spacing.five }}>
        <View style={styles.filters}>
          <CategoryFilterBar
            categories={vm.categories}
            selectedCategoryId={vm.selectedCategoryId}
            onSelectCategory={vm.selectCategory}
            onPressFilters={vm.openFilters}
            isLoading={vm.isLoadingCategories}
          />
        </View>

        <View style={styles.sections}>
          <BannerCarousel slides={vm.mainBanners} isLoading={vm.isLoadingMainBanners} />

          <CategoriesSection
            categories={vm.categories}
            isLoading={vm.isLoadingCategories}
            onPressSeeAll={vm.seeAllCategories}
            onPressCategory={vm.openCategory}
          />

          <ProductSection
            title="Promociones"
            products={vm.promotions}
            isLoading={vm.isLoadingPromotions}
            onPressSeeAll={vm.seeAllPromotions}
            onPressProduct={vm.openProduct}
            onAddProduct={vm.addToCart}
          />

          <ProductSection
            title="Populares"
            products={vm.popular}
            isLoading={vm.isLoadingPopular}
            onPressSeeAll={vm.seeAllPopular}
            onPressProduct={vm.openProduct}
            onAddProduct={vm.addToCart}
          />

          <BannerCarousel slides={vm.secondaryBanners} isLoading={vm.isLoadingSecondaryBanners} />

          <ProductSection
            title="Mercado"
            products={vm.market}
            isLoading={vm.isLoadingMarket}
            onPressSeeAll={vm.seeAllMarket}
            onPressProduct={vm.openProduct}
            onAddProduct={vm.addToCart}
          />

          <View style={styles.paymentMethods}>
            <PaymentMethodsBanner />
          </View>

          <LocationsSection warehouses={vm.warehouses} isLoading={vm.isLoadingWarehouses} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sections: {
    gap: Spacing.five,
  },
  paymentMethods: {
    paddingHorizontal: Spacing.three,
  },
  filters: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
