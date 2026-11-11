import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useFavoritesContext } from '@/contexts/favorites-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import type { Product } from '@/models/warehouse.model';
import { productService } from '@/services/product.service';
import { useCartProductActions } from '@/viewmodels/useCartProductActions';

/** Pestaña Favoritos: los productos guardados que tiene la tienda elegida. */
export function useFavoritesViewModel() {
  const { selectedWarehouse } = useWarehouseContext();
  const warehouseId = selectedWarehouse?.id ?? null;
  const { favoriteIds } = useFavoritesContext();

  // Resultado guardado junto a lo que se pidió, para saber si está al día.
  const requestKey = `${warehouseId}|${favoriteIds.join(',')}`;
  const [result, setResult] = useState<{
    key: string | null;
    products: Product[];
    error: string | null;
  }>({ key: null, products: [], error: null });

  useEffect(() => {
    if (!warehouseId) return;
    let isActive = true;
    productService
      .getByIds(warehouseId, favoriteIds)
      .then((data) => {
        if (!isActive) return;
        // Mismo orden que los favoritos (el más reciente primero).
        const order = new Map(favoriteIds.map((id, index) => [id, index]));
        data.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        setResult({ key: requestKey, products: data, error: null });
      })
      .catch(
        (err) =>
          isActive &&
          setResult({
            key: requestKey,
            products: [],
            error: err instanceof Error ? err.message : 'No pudimos cargar tus favoritos',
          }),
      );
    return () => {
      isActive = false;
    };
  }, [favoriteIds, requestKey, warehouseId]);

  const isCurrent = result.key === requestKey;
  const products = isCurrent ? result.products : [];

  const cartActions = useCartProductActions(warehouseId);
  const cart = useCartContext();
  const openCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cart.open();
  }, [cart]);

  const openProduct = useCallback((product: Product) => {
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  }, []);

  const goExplore = useCallback(() => router.navigate('/'), []);

  return {
    products,
    // Favoritos guardados que la tienda elegida no tiene.
    unavailableCount: isCurrent ? Math.max(favoriteIds.length - products.length, 0) : 0,
    hasFavorites: favoriteIds.length > 0,
    warehouseName: selectedWarehouse?.name ?? null,
    isLoading: favoriteIds.length > 0 && !isCurrent,
    error: isCurrent ? result.error : null,
    cartCount: cart.itemCount,
    openCart,
    openProduct,
    goExplore,
    ...cartActions,
  };
}
