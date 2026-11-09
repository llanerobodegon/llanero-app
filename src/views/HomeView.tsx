import { StyleSheet, View } from 'react-native';

import { CategoryFilterBar } from '@/components/category-filter-bar';
import { HomeTopBar } from '@/components/home-top-bar';
import { WarehouseSelector } from '@/components/warehouse-selector';
import { Spacing } from '@/constants/theme';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

export function HomeView() {
  const vm = useHomeViewModel();

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

      <View style={styles.filters}>
        <CategoryFilterBar
          categories={vm.categories}
          selectedCategoryId={vm.selectedCategoryId}
          onSelectCategory={vm.selectCategory}
          onPressFilters={vm.openFilters}
          isLoading={vm.isLoadingCategories}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
