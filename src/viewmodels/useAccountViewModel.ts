import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

import { initials, maskEmail } from '@/lib/format';
import type { User } from '@/models/user.model';
import { userService } from '@/services/user.service';

type PendingAction = 'logout' | 'delete' | null;

export function useAccountViewModel() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    userService
      .getCurrent()
      .then((data) => {
        if (!isActive) return;
        setUser(data);
        setError(null);
      })
      .catch(
        (err) =>
          isActive && setError(err instanceof Error ? err.message : 'Error al cargar tu cuenta'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, []);

  /** Vibración ligera al tocar una opción del menú. */
  const tap = useCallback((action: () => void) => {
    Haptics.selectionAsync();
    action();
  }, []);

  // TODO: navegar a cada pantalla cuando exista.
  const openPersonalInfo = useCallback(() => tap(() => {}), [tap]);
  const openAddresses = useCallback(() => tap(() => {}), [tap]);
  const openPaymentMethods = useCallback(() => tap(() => {}), [tap]);
  const openChangePassword = useCallback(() => tap(() => {}), [tap]);
  const openNotifications = useCallback(() => tap(() => {}), [tap]);
  // TODO: abrir las páginas legales (expo-web-browser) cuando estén las URLs.
  const openTerms = useCallback(() => tap(() => {}), [tap]);
  const openPrivacy = useCallback(() => tap(() => {}), [tap]);

  // Cerrar sesión y eliminar cuenta piden confirmación.
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const requestLogout = useCallback(() => tap(() => setPendingAction('logout')), [tap]);
  const requestDeleteAccount = useCallback(() => tap(() => setPendingAction('delete')), [tap]);
  const cancelPendingAction = useCallback(() => setPendingAction(null), []);
  const confirmPendingAction = useCallback(() => {
    Haptics.notificationAsync(
      pendingAction === 'delete'
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success,
    );
    // TODO: cerrar sesión (supabase.auth.signOut) / eliminar la cuenta cuando exista la sesión.
    setPendingAction(null);
  }, [pendingAction]);

  const appVersion = Constants.expoConfig?.version ?? '';

  return {
    user,
    isLoading,
    error,
    fullName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    maskedEmail: user ? maskEmail(user.email) : '',
    initials: user ? initials(user.firstName, user.lastName) : '',
    appVersion,

    openPersonalInfo,
    openAddresses,
    openPaymentMethods,
    openChangePassword,
    openNotifications,
    openTerms,
    openPrivacy,

    pendingAction,
    requestLogout,
    requestDeleteAccount,
    cancelPendingAction,
    confirmPendingAction,
  };
}
