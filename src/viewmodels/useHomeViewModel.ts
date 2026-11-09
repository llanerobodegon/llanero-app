import { useCallback, useEffect, useState } from 'react';

import { useWarehouseContext } from '@/contexts/warehouse-context';
import type { Category } from '@/models/warehouse.model';
import { categoryService } from '@/services/category.service';

export function useHomeViewModel() {
  const { warehouses, selectedWarehouse, selectWarehouse, isLoading, error } =
    useWarehouseContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    categoryService
      .getActive()
      .then((data) => {
        if (!isActive) return;
        setCategories(data);
        setCategoriesError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setCategoriesError(err instanceof Error ? err.message : 'Error al cargar las categorías');
      })
      .finally(() => isActive && setIsLoadingCategories(false));
    return () => {
      isActive = false;
    };
  }, []);

  /** Elige una categoría; tocar la que ya está elegida la quita. */
  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId((current) => (current === categoryId ? null : categoryId));
  }, []);

  // TODO: abrir la hoja de filtros cuando exista.
  const openFilters = useCallback(() => {}, []);

  return {
    warehouses,
    selectedWarehouse,
    selectWarehouse,
    isLoadingWarehouses: isLoading,
    warehousesError: error,
    categories,
    selectedCategoryId,
    selectCategory,
    isLoadingCategories,
    categoriesError,
    openFilters,
  };
}
