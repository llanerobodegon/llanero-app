import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/banner-carousel';
import { CategoryFilterBar } from '@/components/category-filter-bar';
import { HomeTopBar } from '@/components/home-top-bar';
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
  filters: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
