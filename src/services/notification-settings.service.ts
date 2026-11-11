import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { NotificationSettings } from '@/models/notification-settings.model';

/**
 * Notificaciones push. La web (Edge Function `notify-order-status`) envía los avisos con Expo
 * Push a `users.push_token`, solo si `users.app_notification` es `true`.
 */

/** Canal de Android (debe coincidir con `defaultChannel` del plugin en app.json). */
const ANDROID_CHANNEL_ID = 'default';

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');
  return id;
}

/** En Android 13+ el permiso no se pide hasta que existe un canal. */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Pedidos y novedades',
    importance: AndroidImportance.HIGH,
    lightColor: '#790102',
  });
}

/** Token de Expo Push de este teléfono (requiere permiso concedido y un dispositivo real). */
async function getPushToken(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Las notificaciones solo funcionan en un teléfono, no en el simulador');
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

async function isPermissionGranted(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** "No volver a mostrar" del aviso para activar notificaciones, por usuario y en este teléfono. */
const promptDismissedKey = (userId: string) => `llanero.notifications-prompt.dismissed.${userId}`;

/**
 * Qué hacer con el aviso "Activa las notificaciones" al entrar a la app:
 * - `hidden`: no mostrarlo (ya hay permiso, el usuario pidió no verlo más, o no es un teléfono).
 * - `ask`: el sistema todavía puede preguntar; "Activar" abre su diálogo de permiso.
 * - `settings`: el permiso ya se negó; solo se puede activar desde los Ajustes del teléfono.
 */
export type NotificationsPromptState = 'hidden' | 'ask' | 'settings';

export const notificationSettingsService = {
  /** Estado del aviso para activar notificaciones (ver `NotificationsPromptState`). */
  async getPromptState(): Promise<NotificationsPromptState> {
    try {
      if (Platform.OS === 'web' || !Device.isDevice) return 'hidden';
      const id = await currentUserId();
      if (localStorage.getItem(promptDismissedKey(id)) === '1') return 'hidden';
      const permission = await Notifications.getPermissionsAsync();
      if (permission.granted) return 'hidden';
      return permission.canAskAgain ? 'ask' : 'settings';
    } catch {
      return 'hidden';
    }
  },

  /** "No volver a mostrar": el aviso no vuelve a salir para este usuario en este teléfono. */
  async dismissPromptForever(): Promise<void> {
    try {
      const id = await currentUserId();
      localStorage.setItem(promptDismissedKey(id), '1');
    } catch {
      // Sin almacenamiento, el aviso volverá a salir en la próxima apertura.
    }
  },

  /** Activas si el cliente las quiere (`app_notification`) y el teléfono da permiso. */
  async get(): Promise<NotificationSettings> {
    const id = await currentUserId();
    const { data, error } = await supabase
      .from('users')
      .select('app_notification')
      .eq('id', id)
      .single();
    if (error) throw new Error('No pudimos cargar tus preferencias');
    return { isEnabled: !!data.app_notification && (await isPermissionGranted()) };
  },

  /**
   * Activa: pide permiso, obtiene el token y lo guarda con `app_notification = true`.
   * Desactiva: `app_notification = false` (la web deja de enviar).
   */
  async setEnabled(isEnabled: boolean): Promise<NotificationSettings> {
    const id = await currentUserId();

    if (!isEnabled) {
      const { error } = await supabase
        .from('users')
        .update({ app_notification: false })
        .eq('id', id);
      if (error) throw new Error('No pudimos guardar tu preferencia');
      return { isEnabled: false };
    }

    await ensureAndroidChannel();
    let granted = await isPermissionGranted();
    if (!granted) {
      ({ granted } = await Notifications.requestPermissionsAsync());
    }
    if (!granted) {
      throw new Error(
        'Activa los permisos de notificaciones de Llanero en los Ajustes del teléfono',
      );
    }

    const token = await getPushToken();
    const { error } = await supabase
      .from('users')
      .update({ app_notification: true, push_token: token })
      .eq('id', id);
    if (error) throw new Error('No pudimos guardar tu preferencia');
    return { isEnabled: true };
  },

  /**
   * Al abrir la app con sesión: si el cliente tiene las notificaciones activas y el permiso,
   * actualiza el token (puede cambiar al reinstalar). No pide permiso ni muestra errores.
   */
  async syncPushToken(): Promise<void> {
    try {
      const id = await currentUserId();
      if (!(await isPermissionGranted()) || !Device.isDevice) return;
      const { data } = await supabase
        .from('users')
        .select('app_notification, push_token')
        .eq('id', id)
        .single();
      if (!data?.app_notification) return;
      await ensureAndroidChannel();
      const token = await getPushToken();
      if (token !== data.push_token) {
        await supabase.from('users').update({ push_token: token }).eq('id', id);
      }
    } catch {
      // Sin red o sin permiso: se reintenta en la próxima apertura.
    }
  },

  /** Antes de cerrar sesión: este teléfono deja de recibir los avisos de esa cuenta. */
  async clearDeviceToken(): Promise<void> {
    try {
      const id = await currentUserId();
      await supabase.from('users').update({ push_token: null }).eq('id', id);
    } catch {
      // Si falla, la sesión se cierra igual.
    }
  },
};
