import type { Category } from '@/models/warehouse.model';

import { ImageRowSection } from './image-row-section';

/** Ancho de cada banner; el alto sale de la proporción 2:1 (200 × 100). */
const BANNER_WIDTH = 200;

type CategoriesSectionProps = {
  title?: string;
  categories: Category[];
  isLoading?: boolean;
  onPressCategory?: (category: Category) => void;
};

/** Fila horizontal de banners 2:1, uno por categoría (`categories.image_url`). */
export function CategoriesSection({
  title = 'Categorías',
  categories,
  isLoading = false,
  onPressCategory,
}: CategoriesSectionProps) {
  const items = categories.map((category) => ({
    id: category.id,
    imageUrl: category.imageUrl,
    label: category.name,
    category,
  }));

  return (
    <ImageRowSection
      title={title}
      items={items}
      itemWidth={BANNER_WIDTH}
      showLabelInPlaceholder
      isLoading={isLoading}

      onPressItem={onPressCategory ? (item) => onPressCategory(item.category) : undefined}
    />
  );
}
