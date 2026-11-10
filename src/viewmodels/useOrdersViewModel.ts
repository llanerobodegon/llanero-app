import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isActiveOrder } from '@/lib/order-status';
import type { Order } from '@/models/order.model';
import { orderService } from '@/services/order.service';

export type OrdersTab = 'active' | 'history';

export function useOrdersViewModel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pestaña elegida por el cliente; mientras no elija, se decide según haya pedidos en curso.
  const [selectedTab, setSelectedTab] = useState<OrdersTab | null>(null);
  const requestId = useRef(0);

  const fetchOrders = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const data = await orderService.getMine();
      if (id !== requestId.current) return;
      setOrders(data);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar tus pedidos');
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Recarga al entrar a la pestaña (por si algo cambió mientras la app estaba cerrada).
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  // Tiempo real: cuando la tienda cambia el estado o el pago de un pedido, la lista se
  // actualiza sola (sin esqueletos) y el teléfono vibra suave.
  useEffect(
    () =>
      orderService.subscribeToMine(() => {
        Haptics.selectionAsync();
        fetchOrders();
      }),
    [fetchOrders],
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchOrders();
  }, [fetchOrders]);

  const activeOrders = useMemo(() => orders.filter((o) => isActiveOrder(o.status)), [orders]);
  const pastOrders = useMemo(() => orders.filter((o) => !isActiveOrder(o.status)), [orders]);

  const tab: OrdersTab =
    selectedTab ?? (activeOrders.length === 0 && pastOrders.length > 0 ? 'history' : 'active');

  const selectTab = useCallback((value: string) => {
    Haptics.selectionAsync();
    setSelectedTab(value === 'history' ? 'history' : 'active');
  }, []);

  /** Abre el detalle del pedido (modal). */
  const openOrder = useCallback((order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/order/[id]', params: { id: order.id } });
  }, []);

  /** Estado vacío: volver al Inicio a comprar. */
  const goShopping = useCallback(() => {
    router.navigate('/');
  }, []);

  return {
    tab,
    selectTab,
    visibleOrders: tab === 'active' ? activeOrders : pastOrders,
    activeCount: activeOrders.length,
    isLoading,
    isRefreshing,
    error,
    refresh,
    retry,
    openOrder,
    goShopping,
  };
}
