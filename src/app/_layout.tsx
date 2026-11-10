import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { useEffect } from 'react';
import { LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuthContext } from '@/contexts/auth-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { notificationSettingsService } from '@/services/notification-settings.service';
import { CartProvider } from '@/contexts/cart-context';
import { WarehouseProvider } from '@/contexts/warehouse-context';
import { CartDrawerView } from '@/views/CartDrawerView';

SplashScreen.preventAutoHideAsync();

// @gorhom/bottom-sheet (vía heroui-native) pasa deps a hooks de Reanimated; en native se ignoran y es inofensivo.
LogBox.ignoreLogs(['[Reanimated] Dependencies should only be used on the web']);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <AuthProvider>
          <WarehouseProvider>
            <CartProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AnimatedSplashOverlay />
                <RootNavigator />
              </ThemeProvider>
            </CartProvider>
          </WarehouseProvider>
        </AuthProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Navegación según la sesión: sin sesión solo el ingreso; con sesión, la app. Al entrar o salir,
 * Expo Router lleva solo a la primera pantalla disponible (no hace falta navegar a mano).
 */
function RootNavigator() {
  const { isLoading, isSignedIn } = useAuthContext();
  usePushNotifications(isSignedIn);

  // Con sesión, refresca el token de notificaciones si el cliente las tiene activas.
  useEffect(() => {
    if (isSignedIn) notificationSettingsService.syncPushToken();
  }, [isSignedIn]);

  // Mientras se lee la sesión guardada se mantiene el splash (no se muestra ni la app ni el ingreso).
  if (isLoading) return null;

  return (
    // El carrito empuja toda la app (pestañas incluidas) hacia la izquierda; sin sesión no se abre.
    <CartDrawerView isEnabled={isSignedIn}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ---------- Con sesión ---------- */}
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          {/* Detalle de producto: hoja modal por encima de las pestañas */}
          <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
          {/* Detalle de pedido: misma hoja modal que el producto */}
          <Stack.Screen name="order/[id]" options={{ presentation: 'modal' }} />
          {/* Categoría: push con su propio encabezado */}
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="subcategory/[id]" />
          {/* Checkout: push a pantalla completa desde el carrito */}
          <Stack.Screen name="checkout/index" />
          <Stack.Screen name="checkout/payment" />
          {/* Resultado: sin gesto de volver (el pedido ya se hizo) */}
          <Stack.Screen name="checkout/success" options={{ gestureEnabled: false }} />
          {/* Pantallas internas de la cuenta: push con su propio encabezado (ScreenHeader) */}
          <Stack.Screen name="account/personal-info" />
          <Stack.Screen name="account/change-password" />
          <Stack.Screen name="account/notifications" />
          <Stack.Screen name="account/addresses/index" />
          <Stack.Screen name="account/addresses/new" />
          <Stack.Screen name="account/addresses/[id]" />
          <Stack.Screen name="account/payment-methods/index" />
          <Stack.Screen name="account/payment-methods/new" />
          <Stack.Screen name="account/payment-methods/[id]" />
          {/* Bienvenida tras registrarse: ya hay sesión; sin volver */}
          <Stack.Screen
            name="auth/registered"
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
        </Stack.Protected>

        {/* ---------- Sin sesión ---------- */}
        <Stack.Protected guard={!isSignedIn}>
          {/* Bienvenida: sin gesto de volver */}
          <Stack.Screen name="auth/index" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="auth/login" />
        </Stack.Protected>

        {/* ---------- Siempre disponibles ----------
            Registro y recuperar contraseña inician la sesión a mitad del flujo (al verificar el
            código), así que no pueden depender de la sesión o se cerrarían antes de terminar. */}
        {/* Registro: el gesto de volver sale del registro; "atrás" del encabezado va al paso anterior */}
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
      </Stack>
    </CartDrawerView>
  );
}
