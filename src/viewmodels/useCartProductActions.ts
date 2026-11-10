import * as Haptics from 'expo-haptics';
import { useCallback, useMemo } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import type { Product } from '@/models/warehouse.model';

/**
 * Acciones de carrito para las tarjetas de producto (Inicio, Buscar): agregar, sumar, restar y
 * cuántas unidades hay. Las cantidades solo cuentan si el carrito es de la tienda elegida.
 * No es una pantalla: lo usan los ViewModels que muestran tarjetas de producto.
 */
export function useCartProductActions(warehouseId: string | null) {
  const cart = useCartContext();

  const cartQuantities = useMemo(() => {
    const map = new Map<string, number>();
    if (cart.warehouseId === warehouseId) {
      for (const item of cart.items) map.set(item.productId, item.quantity);
    }
    return map;
  }, [cart.items, cart.warehouseId, warehouseId]);

  const getCartQuantity = useCallback(
    (productId: string) => cartQuantities.get(productId) ?? 0,
    [cartQuantities],
  );

  /** "+" de una tarjeta: agrega sin abrir el carrito. */
  const addToCart = useCallback(
    (product: Product) => {
      if (!warehouseId) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      cart.addProduct(product, warehouseId);
    },
    [cart, warehouseId],
  );

  const incrementProduct = useCallback(
    (product: Product) => {
      Haptics.selectionAsync();
      cart.increment(product.id);
    },
    [cart],
  );

  const decrementProduct = useCallback(
    (product: Product) => {
      Haptics.selectionAsync();
      cart.decrement(product.id);
    },
    [cart],
  );

  return { getCartQuantity, addToCart, incrementProduct, decrementProduct };
}
