import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Con la app abierta, los avisos se muestran como banner (por defecto no se verían).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Abre el pedido del aviso tocado. La web envía `data: { order_id, order_number, status }`.
 * Para un repartidor es el detalle de su entrega; para un cliente, el de su pedido.
 */
function openFromResponse(
  response: Notifications.NotificationResponse | null,
  isDelivery: boolean,
) {
  const orderId = response?.notification.request.content.data?.order_id;
  if (typeof orderId === 'string' && orderId) {
    router.push({
      pathname: isDelivery ? '/delivery/[id]' : '/order/[id]',
      params: { id: orderId },
    });
  }
}

/**
 * Con sesión (y su rol ya resuelto): abre el pedido al tocar un aviso, tanto con la app abierta como si el toque la
 * abrió desde cerrada. Se usa una vez en el layout raíz.
 */
export function usePushNotifications(isSignedIn: boolean, isDelivery: boolean) {
  useEffect(() => {
    if (!isSignedIn || Platform.OS === 'web') return;

    // La app se abrió tocando un aviso.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      openFromResponse(response, isDelivery);
      Notifications.clearLastNotificationResponseAsync();
    });

    // Toques con la app ya abierta.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) =>
      openFromResponse(response, isDelivery),
    );
    return () => subscription.remove();
  }, [isSignedIn, isDelivery]);
}
