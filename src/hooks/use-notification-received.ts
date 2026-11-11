import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Llama a `onReceived` cuando llega un aviso con la app abierta. El modo repartidor lo usa
 * para refrescar sus entregas, además de la señal en tiempo real.
 */
export function useNotificationReceived(onReceived: () => void): void {
  const callback = useRef(onReceived);
  useEffect(() => {
    callback.current = onReceived;
  }, [onReceived]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = Notifications.addNotificationReceivedListener(() => callback.current());
    return () => subscription.remove();
  }, []);
}
