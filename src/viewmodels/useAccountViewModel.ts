import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { LegalLinks } from '@/constants/links';
import { useActionColor } from '@/hooks/use-action-foreground';
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
  // Páginas legales en el navegador dentro de la app (Safari en iOS, Custom Tabs en Android).
  const actionColor = useActionColor();
  const openInAppBrowser = useCallback(
    (url: string) =>
      tap(() => {
        WebBrowser.openBrowserAsync(url, {
          // iOS: botones del color de acción sobre la barra del sistema.
          controlsColor: actionColor,
          // Android: barra del color de acción (Custom Tabs pone los íconos en blanco).
          toolbarColor: Platform.OS === 'android' ? actionColor : undefined,
          dismissButtonStyle: 'close',
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        }).catch(() => {});
      }),
    [actionColor, tap],
  );
  const openTerms = useCallback(() => openInAppBrowser(LegalLinks.terms), [openInAppBrowser]);
  const openPrivacy = useCallback(() => openInAppBrowser(LegalLinks.privacy), [openInAppBrowser]);

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
