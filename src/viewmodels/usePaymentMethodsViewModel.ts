import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { SavedPaymentMethod } from '@/models/payment-method.model';
import { paymentMethodService } from '@/services/payment-method.service';

export function usePaymentMethodsViewModel() {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setError(null);
      setPaymentMethods(await paymentMethodService.getMine());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus métodos de pago');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recarga al volver a la pantalla (p. ej. después de agregar un método).
  useFocusEffect(
    useCallback(() => {
      fetchPaymentMethods();
    }, [fetchPaymentMethods]),
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  /** Abre el formulario de nuevo método de pago. */
  const addPaymentMethod = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/account/payment-methods/new');
  }, []);

  // TODO: abrir el método en modo edición cuando exista.
  const editPaymentMethod = useCallback((_method: SavedPaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const goBack = useCallback(() => router.back(), []);

  return {
    paymentMethods,
    isEmpty: paymentMethods.length === 0,
    isLoading,
    error,
    retry,
    addPaymentMethod,
    editPaymentMethod,
    goBack,
  };
}
