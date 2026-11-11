import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Linking } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import {
  getOrderStatusDescription,
  getOrderStatusInfo,
  getPaymentMethodLabel,
  getPaymentStatusInfo,
  isActiveOrder,
} from '@/lib/order-status';
import { telUrl, telUrlFromText } from '@/lib/contact';
import { whatsAppUrl } from '@/lib/whatsapp';
import type { Order } from '@/models/order.model';
import { orderService } from '@/services/order.service';

export function useOrderDetailViewModel(orderId: string) {
  // Resultado guardado junto a su id (y al intento) para saber si está al día sin `setState` síncrono.
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${orderId}:${attempt}`;
  // Recargas en silencio por cambios en tiempo real: no cambian la clave, así no hay esqueletos.
  const [liveVersion, setLiveVersion] = useState(0);
  const [state, setState] = useState<{
    key: string | null;
    order: Order | null;
    error: string | null;
  }>({ key: null, order: null, error: null });

  useEffect(() => {
    let isActive = true;
    orderService
      .getById(orderId)
      .then(
        (order) =>
          isActive &&
          setState({
            key: requestKey,
            order,
            error: order ? null : 'No encontramos este pedido',
          }),
      )
      .catch(
        (err) =>
          isActive &&
          setState({
            key: requestKey,
            order: null,
            error: err instanceof Error ? err.message : 'Error al cargar el pedido',
          }),
      );
    return () => {
      isActive = false;
    };
  }, [liveVersion, orderId, requestKey]);

  // Tiempo real: el detalle se actualiza solo cuando la tienda cambia el pedido.
  useEffect(
    () =>
      orderService.subscribeToOrder(orderId, () => {
        Haptics.selectionAsync();
        setLiveVersion((value) => value + 1);
      }),
    [orderId],
  );

  const isCurrent = state.key === requestKey;
  const order = isCurrent ? state.order : null;

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const close = useCallback(() => router.back(), []);

  // Repartidor: solo mientras el pedido de delivery sigue en curso y ya hay alguien asignado.
  const deliveryPerson =
    order?.deliveryType === 'delivery' && isActiveOrder(order.status) ? order.deliveryPerson : null;
  const deliveryPersonWhatsApp =
    deliveryPerson?.phoneCode && deliveryPerson.phone
      ? whatsAppUrl(
          `${deliveryPerson.phoneCode}${deliveryPerson.phone}`,
          `Hola ${deliveryPerson.firstName}, te escribo por mi pedido ${order!.orderNumber} de Llanero.`,
        )
      : null;

  // Tienda: siempre visible, por si el repartidor no responde o hay dudas con el pedido.
  const storeWhatsApp = order
    ? whatsAppUrl(order.warehouse.phone, `Hola, te escribo por mi pedido ${order.orderNumber}.`)
    : null;

  // Llamada normal, por si el número no tiene WhatsApp.
  const deliveryPersonTel = deliveryPerson
    ? telUrl(deliveryPerson.phoneCode, deliveryPerson.phone)
    : null;
  const storeTel = order ? telUrlFromText(order.warehouse.phone) : null;

  /** Abre WhatsApp (o wa.me en el navegador si no está instalado) con un mensaje listo, o la llamada. */
  const openLink = useCallback((url: string | null) => {
    if (!url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => {});
  }, []);
  const contactDeliveryPerson = useCallback(
    () => openLink(deliveryPersonWhatsApp),
    [openLink, deliveryPersonWhatsApp],
  );
  const contactStore = useCallback(
    () => openLink(storeWhatsApp),
    [openLink, storeWhatsApp],
  );

  const callDeliveryPerson = useCallback(
    () => openLink(deliveryPersonTel),
    [openLink, deliveryPersonTel],
  );
  const callStore = useCallback(() => openLink(storeTel), [openLink, storeTel]);

  return {
    order,
    isLoading: !isCurrent,
    error: isCurrent ? state.error : null,
    retry,
    close,
    deliveryPerson,
    deliveryPersonInitials: deliveryPerson
      ? `${deliveryPerson.firstName.charAt(0)}${deliveryPerson.lastName.charAt(0)}`.toUpperCase()
      : '',
    contactDeliveryPerson: deliveryPersonWhatsApp ? contactDeliveryPerson : undefined,
    contactStore: storeWhatsApp ? contactStore : undefined,
    callDeliveryPerson: deliveryPersonTel ? callDeliveryPerson : undefined,
    callStore: storeTel ? callStore : undefined,

    isActive: order ? isActiveOrder(order.status) : false,
    isDelivery: order?.deliveryType === 'delivery',
    isCancelled: order?.status === 'cancelled',
    units: order ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
    statusLabel: order ? getOrderStatusInfo(order).label : '',
    statusDescription: order ? getOrderStatusDescription(order) : '',
    paymentMethodLabel: order ? getPaymentMethodLabel(order.paymentMethodType) : '',
    paymentStatus: order ? getPaymentStatusInfo(order.paymentStatus) : null,
  };
}
