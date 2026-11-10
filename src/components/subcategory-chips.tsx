import { Chip, Skeleton } from 'heroui-native';
import { ScrollView } from 'react-native';

import type { Subcategory } from '@/models/warehouse.model';

const SKELETON_COUNT = 4;

type SubcategoryChipsProps = {
  subcategories: Subcategory[];
  selectedId: string | null;
  onSelect: (subcategoryId: string) => void;
  isLoading?: boolean;
};

/**
 * Subcategorías en una fila con scroll horizontal. Mismo estilo que las categorías del Inicio;
 * la elegida va en el color de acción.
 */
export function SubcategoryChips({
  subcategories,
  selectedId,
  onSelect,
  isLoading = false,
}: SubcategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="items-center gap-2 px-4">
      {isLoading
        ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))
        : subcategories.map((subcategory) => {
            const isSelected = subcategory.id === selectedId;
            return (
              <Chip
                key={subcategory.id}
                size="lg"
                variant="secondary"
                color="default"
                onPress={() => onSelect(subcategory.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`h-10 px-4 ${isSelected ? 'bg-action' : 'bg-surface'}`}>
                <Chip.Label className={isSelected ? 'text-action-foreground' : undefined}>
                  {subcategory.name}
                </Chip.Label>
              </Chip>
            );
          })}
    </ScrollView>
  );
}
