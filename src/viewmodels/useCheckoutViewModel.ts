import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import type { Address } from '@/models/address.model';
import type { DeliveryType } from '@/models/order.model';
import { addressService } from '@/services/address.service';

/** Pasos del checkout, en orden. */
export const CHECKOUT_STEPS = [
  'Detalles del pedido',
  'Detalles de pago',
  'Pedido realizado',
] as const;

/**
 * Paso 1 del checkout: resumen del carrito, tipo de entrega (delivery o retiro) y, según el
 * tipo, la dirección o la tienda de retiro (la del carrito, no se puede cambiar).
 */
export function useCheckoutViewModel() {
  const cart = useCartContext();
  const { warehouses } = useWarehouseContext();
  // La tienda del pedido es siempre la del carrito.
  const warehouse = warehouses.find((w) => w.id === cart.warehouseId) ?? null;

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');

  // Direcciones del cliente; se recargan al volver (p. ej. después de agregar una).
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      addressService
        .getMine()
        .then((data) => {
          if (!isActive) return;
          setAddresses(data);
          setAddressesError(null);
          // Conserva la elegida si sigue existiendo; si no, la predeterminada (o la primera).
          setSelectedAddressId((current) =>
            current && data.some((a) => a.id === current)
              ? current
              : ((data.find((a) => a.isDefault) ?? data[0])?.id ?? null),
          );
        })
        .catch(
          (err) =>
            isActive &&
            setAddressesError(
              err instanceof Error ? err.message : 'Error al cargar tus direcciones',
            ),
        )
        .finally(() => isActive && setIsLoadingAddresses(false));
      return () => {
        isActive = false;
      };
    }, []),
  );

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  const isDelivery = deliveryType === 'delivery';
  const deliveryFee = isDelivery ? (warehouse?.deliveryFee ?? 0) : 0;
  const total = cart.subtotal + deliveryFee;

  const selectDeliveryType = useCallback((type: DeliveryType) => {
    Haptics.selectionAsync();
    setDeliveryType(type);
  }, []);

  const openAddressSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAddressSheetOpen(true);
  }, []);
  const closeAddressSheet = useCallback(() => setIsAddressSheetOpen(false), []);
  const selectAddress = useCallback((address: Address) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedAddressId(address.id);
    setIsAddressSheetOpen(false);
  }, []);
  const addAddress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAddressSheetOpen(false);
    router.push('/account/addresses/new');
  }, []);

  /** Delivery necesita una dirección; el retiro solo la tienda del carrito. */
  const canContinue = cart.items.length > 0 && !!warehouse && (!isDelivery || !!selectedAddress);

  /** Paso 2 (detalles de pago), con el tipo de entrega y la dirección elegidos. */
  const continueToPayment = useCallback(() => {
    if (!canContinue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/checkout/payment',
      params: {
        deliveryType,
        addressId: deliveryType === 'delivery' ? (selectedAddressId ?? '') : '',
      },
    });
  }, [canContinue, deliveryType, selectedAddressId]);

  const goBack = useCallback(() => router.back(), []);

  const summary = useMemo(
    () => ({
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      deliveryFee,
      total,
    }),
    [cart.itemCount, cart.items, cart.subtotal, deliveryFee, total],
  );

  return {
    currentStep: 0,
    isEmpty: cart.items.length === 0,
    warehouse,
    summary,

    deliveryType,
    isDelivery,
    selectDeliveryType,
    // Costo del delivery de la tienda, para mostrarlo en la opción aunque no esté elegida.
    warehouseDeliveryFee: warehouse?.deliveryFee ?? 0,

    addresses,
    selectedAddress,
    isLoadingAddresses,
    addressesError,
    isAddressSheetOpen,
    openAddressSheet,
    closeAddressSheet,
    selectAddress,
    addAddress,

    canContinue,
    continueToPayment,
    goBack,
  };
}
