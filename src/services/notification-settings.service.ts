import type { NotificationSettings } from '@/models/notification-settings.model';

// TODO: conectar con notificaciones reales cuando se agregue `expo-notifications`:
//   activar: pedir permiso (requestPermissionsAsync), obtener el token de Expo Push y
//     guardarlo en Supabase (la web ya envía pushes desde `notify-order-status`).
//   desactivar: borrar el token del usuario en Supabase.
// La firma no debe cambiar.

/** Preferencia en memoria mientras no hay backend (se reinicia al cerrar la app). */
let mockSettings: NotificationSettings = { isEnabled: true };

export const notificationSettingsService = {
  async get(): Promise<NotificationSettings> {
    return mockSettings;
  },

  async setEnabled(isEnabled: boolean): Promise<NotificationSettings> {
    mockSettings = { ...mockSettings, isEnabled };
    return mockSettings;
  },
};
