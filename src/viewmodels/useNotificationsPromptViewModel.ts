import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { useAuthContext } from '@/contexts/auth-context';
import {
  notificationSettingsService,
  type NotificationsPromptState,
} from '@/services/notification-settings.service';

/**
 * Aviso "Activa las notificaciones" al entrar a la app con sesión, si el teléfono no tiene el
 * permiso. Se puede posponer ("Ahora no", vuelve a salir en la próxima apertura) o descartar
 * para siempre ("No volver a mostrar").
 */
export function useNotificationsPromptViewModel() {
  const { isSignedIn, userId, isDelivery } = useAuthContext();
  // El estado va con su usuario: al cambiar de cuenta se vuelve a evaluar.
  const [prompt, setPrompt] = useState<{ userId: string; state: NotificationsPromptState } | null>(
    null,
  );
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    let isActive = true;
    notificationSettingsService
      .getPromptState()
      .then((state) => isActive && setPrompt({ userId, state }));
    return () => {
      isActive = false;
    };
  }, [isSignedIn, userId]);

  const state: NotificationsPromptState =
    isSignedIn && prompt && prompt.userId === userId ? prompt.state : 'hidden';

  const hide = useCallback(() => {
    setError(null);
    setPrompt((current) => (current ? { ...current, state: 'hidden' } : current));
  }, []);

  /** Activa: pide el permiso del sistema y guarda el token. Si ya se negó, abre los Ajustes. */
  const enable = useCallback(async () => {
    if (isEnabling) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (state === 'settings') {
      hide();
      Linking.openSettings().catch(() => {});
      return;
    }
    setIsEnabling(true);
    setError(null);
    try {
      await notificationSettingsService.setEnabled(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      hide();
    } catch (err) {
      // Si el usuario negó el permiso en el diálogo del sistema, ya solo queda ir a Ajustes.
      const next = await notificationSettingsService.getPromptState();
      if (next === 'hidden') {
        hide();
        return;
      }
      setPrompt((current) => (current ? { ...current, state: next } : current));
      setError(err instanceof Error ? err.message : 'No pudimos activar las notificaciones');
    } finally {
      setIsEnabling(false);
    }
  }, [hide, isEnabling, state]);

  /** "Ahora no": se cierra y vuelve a salir la próxima vez que se abra la app. */
  const postpone = useCallback(() => hide(), [hide]);

  /** "No volver a mostrar". */
  const dismissForever = useCallback(() => {
    Haptics.selectionAsync();
    notificationSettingsService.dismissPromptForever();
    hide();
  }, [hide]);

  return {
    isOpen: state !== 'hidden',
    /** El permiso ya se negó: el botón principal lleva a los Ajustes del teléfono. */
    needsSettings: state === 'settings',
    isDelivery,
    isEnabling,
    error,
    enable,
    postpone,
    dismissForever,
  };
}
