import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { LegalLinks } from '@/constants/links';
import { useInAppBrowser } from '@/hooks/use-in-app-browser';
import { initials, maskEmail } from '@/lib/format';
import type { User } from '@/models/user.model';
import { authService } from '@/services/auth.service';
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

  const openPersonalInfo = useCallback(
    () => tap(() => router.push('/account/personal-info')),
    [tap],
  );
  const openAddresses = useCallback(() => tap(() => router.push('/account/addresses')), [tap]);
  const openPaymentMethods = useCallback(
    () => tap(() => router.push('/account/payment-methods')),
    [tap],
  );
  const openChangePassword = useCallback(
    () => tap(() => router.push('/account/change-password')),
    [tap],
  );
  const openNotifications = useCallback(
    () => tap(() => router.push('/account/notifications')),
    [tap],
  );
  // Páginas legales en el navegador dentro de la app.
  const openInAppBrowser = useInAppBrowser();
  const openTerms = useCallback(
    () => tap(() => openInAppBrowser(LegalLinks.terms)),
    [openInAppBrowser, tap],
  );
  const openPrivacy = useCallback(
    () => tap(() => openInAppBrowser(LegalLinks.privacy)),
    [openInAppBrowser, tap],
  );

  // Cerrar sesión y eliminar cuenta piden confirmación.
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const requestLogout = useCallback(() => tap(() => setPendingAction('logout')), [tap]);
  const requestDeleteAccount = useCallback(() => tap(() => setPendingAction('delete')), [tap]);
  const cancelPendingAction = useCallback(() => setPendingAction(null), []);
  /** Cierra sesión (o elimina la cuenta) y deja solo el inicio de sesión en la navegación. */
  const confirmPendingAction = useCallback(async () => {
    const action = pendingAction;
    setPendingAction(null);
    try {
      if (action === 'delete') {
        await authService.deleteAccount();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await authService.signOut();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // `dismissAll` + `replace`: sin pantallas debajo, "atrás" no vuelve a la cuenta.
      if (router.canDismiss()) router.dismissAll();
      router.replace('/auth');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : action === 'delete'
            ? 'No pudimos eliminar tu cuenta'
            : 'No pudimos cerrar tu sesión',
      );
    }
  }, [pendingAction]);

  const appVersion = Constants.expoConfig?.version ?? '';

  return {
    user,
    isLoading,
    error,
    firstName: user?.firstName.trim() ?? '',
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
