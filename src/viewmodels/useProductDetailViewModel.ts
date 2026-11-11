import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useFavoritesContext } from '@/contexts/favorites-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import { discountPercent, finalPrice } from '@/lib/format';
import type { Product } from '@/models/warehouse.model';
import { productService } from '@/services/product.service';

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export function useProductDetailViewModel(productId: string) {
  const { selectedWarehouse } = useWarehouseContext();
  const warehouseId = selectedWarehouse?.id ?? null;
  const cart = useCartContext();

  // Resultado guardado junto a su clave para saber si está al día sin `setState` síncrono.
  const requestKey = warehouseId ? `${warehouseId}:${productId}` : null;
  const [state, setState] = useState<{
    key: string | null;
    product: Product | null;
    error: string | null;
  }>({ key: null, product: null, error: null });

  useEffect(() => {
    if (!warehouseId || !requestKey) return;
    let isActive = true;
    productService
      .getById(warehouseId, productId)
      .then(
        (product) =>
          isActive &&
          setState({
            key: requestKey,
            product,
            error: product ? null : 'Este producto no está disponible en tu tienda',
          }),
      )
      .catch(
        (err) =>
          isActive &&
          setState({
            key: requestKey,
            product: null,
            error: err instanceof Error ? err.message : 'Error al cargar el producto',
          }),
      );
    return () => {
      isActive = false;
    };
  }, [warehouseId, productId, requestKey]);

  const isCurrent = state.key === requestKey && requestKey !== null;
  const product = isCurrent ? state.product : null;

  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const increment = useCallback(() => {
    Haptics.selectionAsync();
    setQuantity((q) => Math.min(q + 1, MAX_QUANTITY));
  }, []);
  const decrement = useCallback(() => {
    Haptics.selectionAsync();
    setQuantity((q) => Math.max(q - 1, MIN_QUANTITY));
  }, []);

  // Favoritos (se guardan en el teléfono, por usuario; ver FavoritesProvider).
  const favorites = useFavoritesContext();
  const isFavorite = favorites.isFavorite(productId);
  const toggleFavorite = useCallback(() => {
    Haptics.selectionAsync();
    favorites.toggleFavorite(productId);
  }, [favorites, productId]);

  const close = useCallback(() => router.back(), []);

  /** Agrega la cantidad elegida y cierra el detalle (no abre el carrito). */
  const addToCart = useCallback(() => {
    if (!product || !warehouseId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    cart.addProduct(product, warehouseId, quantity);
    router.back();
  }, [cart, product, quantity, warehouseId]);

  const hasDiscount = !!product?.isOnDiscount && product.discountPrice !== null;
  const unitPrice = product
    ? finalPrice(product.price, product.isOnDiscount, product.discountPrice)
    : 0;

  return {
    product,
    isLoading: !isCurrent,
    error: isCurrent ? state.error : null,

    unitPrice,
    originalPrice: hasDiscount ? product!.price : null,
    discountPercent: hasDiscount ? discountPercent(product!.price, product!.discountPrice!) : null,
    totalPrice: unitPrice * quantity,
    showPromoNotice: !!product && (product.isPromo || hasDiscount),

    quantity,
    canDecrement: quantity > MIN_QUANTITY,
    canIncrement: quantity < MAX_QUANTITY,
    increment,
    decrement,

    isFavorite,
    toggleFavorite,

    close,
    addToCart,
  };
}
