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

/** Productos de una subcategoría en la tienda elegida, con buscador. */
export function useSubcategoryViewModel(subcategoryId: string) {
  const { selectedWarehouse } = useWarehouseContext();
  const warehouseId = selectedWarehouse?.id ?? null;

  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  useEffect(() => {
    let isActive = true;
    categoryService
      .getSubcategoryById(subcategoryId)
      .then((data) => isActive && setSubcategory(data))
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, [subcategoryId]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Resultado guardado con su búsqueda, para saber si está al día sin poner `isLoading` a mano.
  const searchKey = `${warehouseId}|${subcategoryId}|${debouncedQuery}`;
  const [result, setResult] = useState<{
    key: string | null;
    products: Product[];
    error: string | null;
  }>({ key: null, products: [], error: null });

  useEffect(() => {
    if (!warehouseId) return;
    let isActive = true;
    productService
      .search(warehouseId, { query: debouncedQuery, subcategoryId })
      .then((products) => isActive && setResult({ key: searchKey, products, error: null }))
      .catch(
        (err) =>
          isActive &&
          setResult({
            key: searchKey,
            products: [],
            error: err instanceof Error ? err.message : 'Error al cargar los productos',
          }),
      );
    return () => {
      isActive = false;
    };
  }, [debouncedQuery, searchKey, subcategoryId, warehouseId]);

  const isCurrent = result.key === searchKey;

  const cartActions = useCartProductActions(warehouseId);
  const cart = useCartContext();
  const openCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cart.open();
  }, [cart]);

  /** Abre el detalle del producto (modal). */
  const openProduct = useCallback((product: Product) => {
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const goBack = useCallback(() => router.back(), []);

  return {
    title: subcategory?.name ?? '',
    query,
    setQuery,
    debouncedQuery,
    clearQuery,

    products: isCurrent ? result.products : [],
    isLoading: !isCurrent,
    error: isCurrent ? result.error : null,

    cartCount: cart.itemCount,
    openCart,
    openProduct,
    goBack,
    ...cartActions,
  };
}
