import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';

export function useCartViewModel() {
  const cart = useCartContext();

  const increment = useCallback(
    (productId: string) => {
      Haptics.selectionAsync();
      cart.increment(productId);
    },
    [cart],
  );

  const decrement = useCallback(
    (productId: string) => {
      Haptics.selectionAsync();
      cart.decrement(productId);
    },
    [cart],
  );

  /**
   * `onOpen` del drawer: la librería lo llama al abrir con el botón y al deslizar (y puede repetirlo
   * con el drawer ya abierto). Solo vibra si venía cerrado, es decir, al abrirlo deslizando;
   * el botón del carrito vibra por su cuenta.
   */
  const handleDrawerOpen = useCallback(() => {
    if (!cart.isOpen) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cart.open();
  }, [cart]);

  // Vaciar todo el carrito, con confirmación.
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const requestClear = useCallback(() => setIsClearConfirmOpen(true), []);
  const cancelClear = useCallback(() => setIsClearConfirmOpen(false), []);
  const confirmClear = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    cart.clear();
    setIsClearConfirmOpen(false);
  }, [cart]);

  // Tienda del carrito: si está cerrada se puede armar el pedido, pero no pagarlo.
  const { warehouses } = useWarehouseContext();
  const cartWarehouse = warehouses.find((w) => w.id === cart.warehouseId) ?? null;
  const [isClosedNoticeOpen, setIsClosedNoticeOpen] = useState(false);
  const closeClosedNotice = useCallback(() => setIsClosedNoticeOpen(false), []);

  /** Cierra el carrito y abre el checkout; con la tienda cerrada, avisa y no continúa. */
  const checkout = useCallback(() => {
    if (cart.items.length === 0) return;
    if (cartWarehouse && !cartWarehouse.isOpen) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setIsClosedNoticeOpen(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cart.close();
    router.push('/checkout');
  }, [cart, cartWarehouse]);

  return {
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    isEmpty: cart.items.length === 0,
    // El carrito es local: no carga ni falla, pero se exponen por convención de los ViewModels.
    isLoading: false,
    error: null as string | null,
    isOpen: cart.isOpen,
    open: cart.open,
    handleDrawerOpen,
    close: cart.close,
    increment,
    decrement,
    checkout,
    isClosedNoticeOpen,
    closeClosedNotice,
    closedWarehouseName: cartWarehouse?.name ?? 'La tienda',
    isClearConfirmOpen,
    requestClear,
    cancelClear,
    confirmClear,
  };
}
