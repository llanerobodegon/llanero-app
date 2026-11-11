import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { Address } from '@/models/address.model';
import { addressService } from '@/services/address.service';

export function useAddressesViewModel() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setError(null);
      setAddresses(await addressService.getMine());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus direcciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recarga al volver a la pantalla (p. ej. después de agregar una dirección).
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses]),
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    fetchAddresses();
  }, [fetchAddresses]);

  /** Abre el formulario de nueva dirección. */
  const addAddress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/account/addresses/new');
  }, []);

  /** Abre la dirección para editarla, eliminarla o marcarla como predeterminada. */
  const editAddress = useCallback((address: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/account/addresses/[id]', params: { id: address.id } });
  }, []);

  const goBack = useCallback(() => router.back(), []);

  return {
    addresses,
    isEmpty: addresses.length === 0,
    isLoading,
    error,
    retry,
    addAddress,
    editAddress,
    goBack,
  };
}
