import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { Category, Subcategory } from '@/models/warehouse.model';
import { categoryService } from '@/services/category.service';

/** Una categoría y la lista de sus subcategorías. */
export function useCategoryViewModel(categoryId: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      categoryService.getById(categoryId),
      categoryService.getSubcategoriesByCategory(categoryId),
    ])
      .then(([categoryData, subcategoriesData]) => {
        if (!isActive) return;
        setCategory(categoryData);
        setSubcategories(subcategoriesData);
        setError(categoryData ? null : 'No encontramos esta categoría');
      })
      .catch(
        (err) =>
          isActive && setError(err instanceof Error ? err.message : 'Error al cargar la categoría'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [attempt, categoryId]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setAttempt((a) => a + 1);
  }, []);

  /** Abre los productos de la subcategoría. */
  const openSubcategory = useCallback((subcategory: Subcategory) => {
    Haptics.selectionAsync();
    router.push({ pathname: '/subcategory/[id]', params: { id: subcategory.id } });
  }, []);

  const goBack = useCallback(() => router.back(), []);

  return {
    title: category?.name ?? 'Categoría',
    subcategories,
    isEmpty: subcategories.length === 0,
    isLoading,
    error,
    retry,
    openSubcategory,
    goBack,
  };
}
