import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useNotificationReceived } from '@/hooks/use-notification-received';
import type { DeliveryAvailability, DeliveryListItem } from '@/models/delivery.model';
import { deliveryService } from '@/services/delivery.service';

/** Pestaña "Entregas" del repartidor: disponibilidad y pedidos asignados sin terminar. */
export function useDeliveriesViewModel() {
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [availability, setAvailability] = useState<DeliveryAvailability>('available');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Error al cambiar la disponibilidad: se muestra junto al interruptor, no tapa la lista. */
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetchAll = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const [list, status] = await Promise.all([
        deliveryService.getActive(),
        deliveryService.getAvailability(),
      ]);
      if (id !== requestId.current) return;
      setDeliveries(list);
      setError(null);
      // "En entrega" sin ningún pedido en camino es un estado atascado (p. ej. el bodegón
      // borró el pedido): se le pide al servidor recalcularlo para que pueda recibir pedidos.
      const isStuck =
        status === 'on_delivery' && !list.some((delivery) => delivery.status === 'on_delivery');
      if (!isStuck) {
        setAvailability(status);
        return;
      }
      const fixed = await deliveryService.setAvailability(true).catch(() => status);
      if (id === requestId.current) setAvailability(fixed);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar tus entregas');
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Sin tiempo real: se recarga al entrar a la pestaña (también al volver del detalle)…
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  // …y cuando llega un aviso con la app abierta ("Nuevo pedido asignado").
  useNotificationReceived(fetchAll);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchAll();
  }, [fetchAll]);

  /** Alterna disponible / no disponible. Con un pedido en camino no se puede cambiar. */
  const toggleAvailability = useCallback(async () => {
    if (isUpdatingAvailability || availability === 'on_delivery') return;
    Haptics.selectionAsync();
    setIsUpdatingAvailability(true);
    setAvailabilityError(null);
    try {
      setAvailability(await deliveryService.setAvailability(availability === 'unavailable'));
    } catch (err) {
      setAvailabilityError(
        err instanceof Error ? err.message : 'No pudimos cambiar tu disponibilidad',
      );
    } finally {
      setIsUpdatingAvailability(false);
    }
  }, [availability, isUpdatingAvailability]);

  /** Abre el detalle de la entrega (modal). */
  const openDelivery = useCallback((delivery: DeliveryListItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/delivery/[id]', params: { id: delivery.id } });
  }, []);

  return {
    deliveries,
    availability,
    isLoading,
    isRefreshing,
    isUpdatingAvailability,
    error,
    availabilityError,
    refresh,
    retry,
    toggleAvailability,
    openDelivery,
  };
}
