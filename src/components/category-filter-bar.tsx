import { SymbolView } from 'expo-symbols';
import { Button, Chip, Skeleton, useThemeColor } from 'heroui-native';
import { ScrollView } from 'react-native';

import type { Category } from '@/models/warehouse.model';

const SKELETON_COUNT = 4;

type CategoryFilterBarProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onPressFilters?: () => void;
  isLoading?: boolean;
};

/** Fila horizontal: botón de filtros y un chip por categoría del catálogo. */
export function CategoryFilterBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onPressFilters,
  isLoading = false,
}: CategoryFilterBarProps) {
  const [background] = useThemeColor(['background']);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-2 px-4">
      <Button
        isIconOnly
        size="lg"
        onPress={onPressFilters}
        accessibilityLabel="Filtros"
        className="rounded-full bg-foreground">
        <SymbolView
          name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
          size={20}
          tintColor={background}
        />
      </Button>

      {isLoading
        ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))
        : categories.map((category) => {
            const isSelected = category.id === selectedCategoryId;
            return (
              <Chip
                key={category.id}
                size="lg"
                variant={isSelected ? 'primary' : 'secondary'}
                color={isSelected ? 'accent' : 'default'}
                onPress={() => onSelectCategory(category.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className="h-10 px-4">
                <Chip.Label>{category.name}</Chip.Label>
              </Chip>
            );
          })}
    </ScrollView>
  );
}
