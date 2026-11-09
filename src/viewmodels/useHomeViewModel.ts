import { useCallback, useEffect, useState } from 'react';

import { useWarehouseContext } from '@/contexts/warehouse-context';
import type { Slider } from '@/models/slider.model';
import type { Category } from '@/models/warehouse.model';
import { categoryService } from '@/services/category.service';
import { SliderPosition, sliderService } from '@/services/slider.service';

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

/**
 * Carga los slides activos de una posición (`SliderPosition`).
 */
function useSliders(position: number) {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    sliderService
      .getActiveByPosition(position)
      .then((data) => {
        if (!isActive) return;
        setSlides(data);
        setError(null);
      })
      .catch((err) => isActive && setError(errorMessage(err, 'Error al cargar los banners')))
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [position]);

  return { slides, isLoading, error };
}

export function useHomeViewModel() {
  const { warehouses, selectedWarehouse, selectWarehouse, isLoading, error } =
    useWarehouseContext();
  const selectedWarehouseId = selectedWarehouse?.id ?? null;

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
      .catch(
        (err) =>
          isActive && setCategoriesError(errorMessage(err, 'Error al cargar las categorías')),
      )
      .finally(() => isActive && setIsLoadingCategories(false));
    return () => {
      isActive = false;
    };
  }, []);

  const mainBanners = useSliders(SliderPosition.main);

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

    mainBanners: mainBanners.slides,
    isLoadingMainBanners: mainBanners.isLoading,
    mainBannersError: mainBanners.error,
  };
}
