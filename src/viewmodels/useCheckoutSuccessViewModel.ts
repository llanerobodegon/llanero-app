import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getOrderStatusDescription, getOrderStatusInfo } from '@/lib/order-status';
import type { Order } from '@/models/order.model';
import { orderService } from '@/services/order.service';

/** Paso 3 del checkout: el pedido recién creado y a dónde ir después. */
export function useCheckoutSuccessViewModel(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    orderService
      .getById(orderId)
      .then((data) => isActive && setOrder(data))
      .catch(() => {})
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [orderId]);

  /** Cierra el checkout, va a Pedidos y abre el detalle del pedido. */
  const viewOrder = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissAll();
    router.navigate('/orders');
    router.push({ pathname: '/order/[id]', params: { id: orderId } });
  }, [orderId]);

  /** Cierra el checkout y vuelve al Inicio. */
  const keepShopping = useCallback(() => {
    Haptics.selectionAsync();
    router.dismissAll();
    router.navigate('/');
  }, []);

  return {
    order,
    isLoading,
    statusLabel: order ? getOrderStatusInfo(order).label : '',
    statusDescription: order ? getOrderStatusDescription(order) : '',
    viewOrder,
    keepShopping,
  };
}
