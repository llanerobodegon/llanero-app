import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { useActionColor } from './use-action-foreground';

/**
 * Abre una URL en el navegador dentro de la app (Safari en iOS, Custom Tabs en Android) con los
 * colores de la app: botones del color de acción en iOS y barra del color de acción en Android.
 */
export function useInAppBrowser() {
  const actionColor = useActionColor();

  return useCallback(
    (url: string) =>
      WebBrowser.openBrowserAsync(url, {
        controlsColor: actionColor,
        toolbarColor: Platform.OS === 'android' ? actionColor : undefined,
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      }).catch(() => {}),
    [actionColor],
  );
}
