import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { notificationSettingsService } from '@/services/notification-settings.service';

export function useNotificationsViewModel() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    notificationSettingsService
      .get()
      .then((settings) => isActive && setIsEnabled(settings.isEnabled))
      .catch(
        (err) =>
          isActive &&
          setError(err instanceof Error ? err.message : 'Error al cargar tus preferencias'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, []);

  /** Cambia el interruptor al instante y lo revierte si no se pudo guardar. */
  const toggle = useCallback(async (value: boolean) => {
    Haptics.selectionAsync();
    setIsEnabled(value);
    setError(null);
    try {
      setIsUpdating(true);
      await notificationSettingsService.setEnabled(value);
    } catch (err) {
      setIsEnabled(!value);
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu preferencia');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const goBack = useCallback(() => router.back(), []);

  return { isEnabled, isLoading, isUpdating, error, toggle, goBack };
}
