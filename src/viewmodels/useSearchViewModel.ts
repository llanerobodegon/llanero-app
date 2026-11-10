import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import type { Product, Subcategory } from '@/models/warehouse.model';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { useCartProductActions } from '@/viewmodels/useCartProductActions';

/** Espera tras la última tecla antes de buscar. */
const SEARCH_DELAY_MS = 250;

export function useSearchViewModel() {
  const { selectedWarehouse } = useWarehouseContext();
  const warehouseId = selectedWarehouse?.id ?? null;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(true);

  // Resultado guardado con su búsqueda, para saber si está al día sin poner `isLoading` a mano.
  const searchKey = `${warehouseId}|${debouncedQuery}|${selectedSubcategoryId}`;
  const [result, setResult] = useState<{
    key: string | null;
    products: Product[];
    error: string | null;
  }>({ key: null, products: [], error: null });

  useEffect(() => {
    let isActive = true;
    categoryService
      .getSubcategories()
      .then((data) => isActive && setSubcategories(data))
      .catch(() => {})
      .finally(() => isActive && setIsLoadingSubcategories(false));
    return () => {
      isActive = false;
    };
  }, []);

  // Busca un momento después de la última tecla.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!warehouseId) return;
    let isActive = true;
    productService
      .search(warehouseId, { query: debouncedQuery, subcategoryId: selectedSubcategoryId })
      .then((products) => isActive && setResult({ key: searchKey, products, error: null }))
      .catch(
        (err) =>
          isActive &&
          setResult({
            key: searchKey,
            products: [],
            error: err instanceof Error ? err.message : 'Error al buscar productos',
          }),
      );
    return () => {
      isActive = false;
    };
  }, [debouncedQuery, searchKey, selectedSubcategoryId, warehouseId]);

  const isCurrent = result.key === searchKey;

  /** Elige una subcategoría; tocar la que ya está elegida la quita. */
  const selectSubcategory = useCallback((subcategoryId: string) => {
    Haptics.selectionAsync();
    setSelectedSubcategoryId((current) => (current === subcategoryId ? null : subcategoryId));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedSubcategoryId(null);
  }, []);

  const cartActions = useCartProductActions(warehouseId);

  const cart = useCartContext();
  /** Botón del carrito en el encabezado. */
  const openCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cart.open();
  }, [cart]);

  /** Abre el detalle del producto (modal). */
  const openProduct = useCallback((product: Product) => {
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  }, []);

  const hasFilters = !!debouncedQuery || !!selectedSubcategoryId;

  return {
    warehouseName: selectedWarehouse?.name ?? null,
    query,
    setQuery,
    debouncedQuery,
    hasFilters,
    clearFilters,

    subcategories,
    isLoadingSubcategories,
    selectedSubcategoryId,
    selectSubcategory,

    products: isCurrent ? result.products : [],
    isLoading: !isCurrent,
    error: isCurrent ? result.error : null,

    openProduct,
    cartCount: cart.itemCount,
    openCart,
    ...cartActions,
  };
}
