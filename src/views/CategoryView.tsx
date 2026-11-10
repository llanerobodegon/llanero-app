import { Skeleton } from 'heroui-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/screen-header';
import { SubcategoryList } from '@/components/subcategory-list';
import { useCategoryViewModel } from '@/viewmodels/useCategoryViewModel';

const SKELETON_COUNT = 5;

/** Categoría: título, volver y sus subcategorías en lista. */
export function CategoryView({ categoryId }: { categoryId: string }) {
  const vm = useCategoryViewModel(categoryId);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={vm.title} onBack={vm.goBack} />

      {vm.isLoading ? (
        <View className="px-4 pt-4">
          <View className="gap-4 rounded-3xl bg-surface p-4">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <View key={index} className="flex-row items-center gap-3">
                <Skeleton className="size-12 rounded-xl" />
                <Skeleton className="h-4 flex-1 rounded-md" />
              </View>
            ))}
          </View>
        </View>
      ) : vm.error ? (
        <EmptyState
          icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
          title="No pudimos cargar la categoría"
          description={vm.error}
          actionLabel="Reintentar"
          onPressAction={vm.retry}
        />
      ) : vm.isEmpty ? (
        <EmptyState
          icon={{ ios: 'square.grid.2x2', android: 'category' }}
          title="Sin subcategorías"
          description="Esta categoría todavía no tiene subcategorías."
          actionLabel="Volver"
          onPressAction={vm.goBack}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <SubcategoryList subcategories={vm.subcategories} onPress={vm.openSubcategory} />
        </ScrollView>
      )}
    </View>
  );
}
