import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';

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

  // TODO: navegar a la pantalla de pago cuando exista.
  const checkout = useCallback(() => {}, []);

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
    isClearConfirmOpen,
    requestClear,
    cancelClear,
    confirmClear,
  };
}
