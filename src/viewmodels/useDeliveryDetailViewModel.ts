import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Linking } from 'react-native';

import { useNotificationReceived } from '@/hooks/use-notification-received';
import { mapsSearchUrl, telUrl, telUrlFromText } from '@/lib/contact';
import { getDeliveryStatusDescription, getDeliveryStatusInfo } from '@/lib/delivery-status';
import { initials } from '@/lib/format';
import { whatsAppUrl } from '@/lib/whatsapp';
import type { DeliveryOrder } from '@/models/delivery.model';
import { DeliveryError, deliveryService } from '@/services/delivery.service';

const CODE_PATTERN = /^\d{4}$/;

/** Abre un enlace externo (teléfono, WhatsApp, mapas) sin romper si no hay app que lo abra. */
function open(url: string) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Linking.openURL(url).catch(() => {});
}

/** Detalle de una entrega: datos para retirar y entregar, "Retiré el pedido" y el código. */
export function useDeliveryDetailViewModel(orderId: string) {
  const [delivery, setDelivery] = useState<DeliveryOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** El pedido no existe o ya no está asignado a este repartidor (reasignado por el admin). */
  const [isNotFound, setIsNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickUpDialogOpen, setIsPickUpDialogOpen] = useState(false);
  const [pickUpError, setPickUpError] = useState<string | null>(null);
  const [isCodeSheetOpen, setIsCodeSheetOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  /** Aviso bajo el estado (p. ej. intentos agotados) que no es un error de carga. */
  const [notice, setNotice] = useState<string | null>(null);
  const requestId = useRef(0);
  // Evita dos envíos por doble toque antes de que React repinte el botón desactivado.
  const isBusy = useRef(false);

  /** Carga el pedido. Devuelve lo que quedó, para decidir después de una acción. */
  const load = useCallback(async (): Promise<DeliveryOrder | null> => {
    const id = ++requestId.current;
    try {
      const data = await deliveryService.getById(orderId);
      if (id !== requestId.current) return data;
      setDelivery(data);
      setIsNotFound(!data);
      setError(null);
      if (!data) {
        setIsCodeSheetOpen(false);
        setIsPickUpDialogOpen(false);
      }
      return data;
    } catch (err) {
      if (id === requestId.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar la entrega');
      }
      throw err;
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [orderId]);

  /** Recarga en silencio: si falla se queda lo que ya se veía. */
  const refresh = useCallback(() => {
    load().catch(() => {});
  }, [load]);

  // Sin tiempo real: se recarga al entrar y cuando llega un aviso con la app abierta.
  useFocusEffect(refresh);
  useNotificationReceived(refresh);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    refresh();
  }, [refresh]);

  const close = useCallback(() => router.back(), []);

  /** Error de una acción: si el pedido ya no es suyo, se muestra eso en vez del detalle. */
  const handleActionError = useCallback((err: unknown): string => {
    if (err instanceof DeliveryError && err.code === 'order_not_found') {
      setDelivery(null);
      setIsNotFound(true);
      setIsCodeSheetOpen(false);
      setIsPickUpDialogOpen(false);
    }
    return err instanceof Error ? err.message : 'Algo salió mal. Inténtalo de nuevo';
  }, []);

  // ---------- Retirar ----------

  const requestPickUp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickUpError(null);
    setIsPickUpDialogOpen(true);
  }, []);

  const cancelPickUp = useCallback(() => setIsPickUpDialogOpen(false), []);

  /** "Retiré el pedido": pasa a en camino y el cliente lo ve al instante. */
  const confirmPickUp = useCallback(async () => {
    if (isBusy.current) return;
    isBusy.current = true;
    setIsSubmitting(true);
    setPickUpError(null);
    try {
      await deliveryService.markPickedUp(orderId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsPickUpDialogOpen(false);
      await load().catch(() => {});
    } catch (err) {
      setPickUpError(handleActionError(err));
      // El estado pudo cambiar en el servidor (lo movió el admin): se muestra el real.
      refresh();
    } finally {
      isBusy.current = false;
      setIsSubmitting(false);
    }
  }, [handleActionError, load, orderId, refresh]);

  // ---------- Entregar con el código ----------

  const openCodeSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCodeError(null);
    setNotice(null);
    setIsCodeSheetOpen(true);
  }, []);

  const closeCodeSheet = useCallback(() => {
    if (isBusy.current) return;
    setIsCodeSheetOpen(false);
    setCodeError(null);
  }, []);

  /** Envía el código que mostró el cliente. Lo valida el servidor. */
  const submitCode = useCallback(
    async (code: string) => {
      if (isBusy.current || !CODE_PATTERN.test(code)) return;
      isBusy.current = true;
      setIsSubmitting(true);
      setCodeError(null);
      try {
        const result = await deliveryService.complete(orderId, code);
        if (result.isCompleted) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsCodeSheetOpen(false);
          await load().catch(() => {});
          return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setDelivery((current) =>
          current ? { ...current, attemptsLeft: result.attemptsLeft } : current,
        );
        if (result.attemptsLeft <= 0) {
          setIsCodeSheetOpen(false);
          setNotice(new DeliveryError('code_locked').message);
        } else {
          setCodeError('Código incorrecto');
        }
      } catch (err) {
        if (err instanceof DeliveryError && err.code === 'code_locked') {
          setIsCodeSheetOpen(false);
          setNotice(err.message);
          refresh();
          return;
        }
        if (err instanceof DeliveryError && err.code !== 'unknown') {
          setCodeError(handleActionError(err));
          refresh();
          return;
        }
        // Fallo de red: no se sabe si el servidor llegó a aplicar el código. Se vuelve a leer
        // el pedido antes de dejar reintentar, para no gastar intentos ni repetir una entrega.
        try {
          const latest = await load();
          if (latest?.status === 'completed') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsCodeSheetOpen(false);
            return;
          }
          setCodeError('No pudimos confirmar. Revisa tu conexión e inténtalo de nuevo');
        } catch {
          setCodeError('Sin conexión. Inténtalo de nuevo cuando tengas señal');
        }
      } finally {
        isBusy.current = false;
        setIsSubmitting(false);
      }
    },
    [handleActionError, load, orderId, refresh],
  );

  // ---------- Contacto ----------

  const customer = delivery?.customer ?? null;
  const customerName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : '';
  const canContactCustomer = !!delivery && !delivery.isContactHidden;

  const customerTel = canContactCustomer
    ? telUrl(customer?.phoneCode ?? null, customer?.phone ?? null)
    : null;
  const customerWhatsApp =
    canContactCustomer && customer?.phoneCode && customer.phone
      ? whatsAppUrl(
          `${customer.phoneCode}${customer.phone}`,
          `Hola, soy tu repartidor de Llanero. Llevo tu pedido ${delivery?.orderNumber}.`,
        )
      : null;
  const address = canContactCustomer ? (delivery?.address ?? null) : null;
  const mapUrl = address ? mapsSearchUrl(`${address.address1}, ${address.city}`) : null;

  const storeTel = delivery ? telUrlFromText(delivery.warehouse.phone) : null;
  const storeWhatsApp = delivery
    ? whatsAppUrl(
        delivery.warehouse.phone,
        `Hola, soy el repartidor del pedido ${delivery.orderNumber}. Necesito ayuda con la entrega.`,
      )
    : null;

  const status = delivery?.status ?? null;

  return {
    delivery,
    isLoading,
    error,
    isNotFound,
    retry,
    close,

    statusLabel: status ? getDeliveryStatusInfo(status).label : '',
    statusDescription: status ? getDeliveryStatusDescription(status) : '',
    notice,
    customerName: customerName || 'Cliente',
    customerInitials: customer ? initials(customer.firstName, customer.lastName) : '',
    units: delivery?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    attemptsLeft: delivery?.attemptsLeft ?? 0,
    isLocked: status === 'on_delivery' && (delivery?.attemptsLeft ?? 0) <= 0,

    isSubmitting,
    isPickUpDialogOpen,
    pickUpError,
    requestPickUp,
    cancelPickUp,
    confirmPickUp,

    isCodeSheetOpen,
    codeError,
    openCodeSheet,
    closeCodeSheet,
    submitCode,

    // `undefined` cuando falta el dato: la vista no muestra ese botón.
    callCustomer: customerTel ? () => open(customerTel) : undefined,
    whatsAppCustomer: customerWhatsApp ? () => open(customerWhatsApp) : undefined,
    openMap: mapUrl ? () => open(mapUrl) : undefined,
    callStore: storeTel ? () => open(storeTel) : undefined,
    whatsAppStore: storeWhatsApp ? () => open(storeWhatsApp) : undefined,
  };
}
