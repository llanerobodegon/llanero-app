import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import type { DeliveryListItem, DeliverySummary } from '@/models/delivery.model';
import { deliveryService, HISTORY_PAGE_SIZE } from '@/services/delivery.service';

const EMPTY_SUMMARY: DeliverySummary = { today: 0, last7Days: 0 };

/** Pestaña "Historial" del repartidor: resumen y pedidos entregados, por páginas. */
export function useDeliveryHistoryViewModel() {
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [summary, setSummary] = useState<DeliverySummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  /** Última página cargada (0 = la primera). */
  const page = useRef(0);

  /** Primera página + resumen. Reemplaza lo que hubiera. */
  const fetchFirstPage = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const [list, totals] = await Promise.all([
        deliveryService.getHistory(0),
        deliveryService.getSummary(),
      ]);
      if (id !== requestId.current) return;
      page.current = 0;
      setDeliveries(list);
      setSummary(totals);
      setHasMore(list.length === HISTORY_PAGE_SIZE);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar tu historial');
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  // Se recarga al entrar a la pestaña: una entrega recién completada aparece arriba.
  useFocusEffect(
    useCallback(() => {
      fetchFirstPage();
    }, [fetchFirstPage]),
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchFirstPage();
  }, [fetchFirstPage]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchFirstPage();
  }, [fetchFirstPage]);

  /** Siguiente página, al llegar al final de la lista. */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;
    const id = requestId.current;
    setIsLoadingMore(true);
    try {
      const next = await deliveryService.getHistory(page.current + 1);
      // Si entre tanto se recargó la lista, esta página ya no corresponde.
      if (id !== requestId.current) return;
      page.current += 1;
      setDeliveries((current) => {
        const known = new Set(current.map((delivery) => delivery.id));
        return [...current, ...next.filter((delivery) => !known.has(delivery.id))];
      });
      setHasMore(next.length === HISTORY_PAGE_SIZE);
    } catch {
      // Sin red: se queda lo ya cargado; se reintenta al volver a llegar al final.
    } finally {
      if (id === requestId.current) setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, isRefreshing]);

  /** Abre el detalle de la entrega (modal, solo lectura). */
  const openDelivery = useCallback((delivery: DeliveryListItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/delivery/[id]', params: { id: delivery.id } });
  }, []);

  return {
    deliveries,
    summary,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    retry,
    loadMore,
    openDelivery,
  };
}
