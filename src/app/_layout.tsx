import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { useEffect } from 'react';
import { LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SplashOverlay } from '@/components/splash-overlay';
import { AuthProvider, useAuthContext } from '@/contexts/auth-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { notificationSettingsService } from '@/services/notification-settings.service';
import { CartProvider } from '@/contexts/cart-context';
import { FavoritesProvider } from '@/contexts/favorites-context';
import { WarehouseProvider } from '@/contexts/warehouse-context';
import { CartDrawerView } from '@/views/CartDrawerView';
import { NotificationsPromptView } from '@/views/NotificationsPromptView';

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
            <FavoritesProvider>
              <CartProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <SplashOverlay />
                  <RootNavigator />
                </ThemeProvider>
              </CartProvider>
            </FavoritesProvider>
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
  const { isLoading, isSignedIn, isDelivery } = useAuthContext();
  // Con el rol ya resuelto: el aviso tocado abre la entrega (repartidor) o el pedido (cliente).
  usePushNotifications(isSignedIn, isDelivery);

  // Con sesión, refresca el token de notificaciones si el cliente las tiene activas.
  useEffect(() => {
    if (isSignedIn) notificationSettingsService.syncPushToken();
  }, [isSignedIn]);

  // A dónde va un repartidor cuando la pantalla en la que está deja de estar disponible (al
  // iniciar sesión, o si la app abre en "/"). Hay que decirlo porque, por defecto, Expo Router
  // redirige al grupo "/(delivery)", que no tiene pantalla `index` y daría "Unmatched Route".
  // Para clientes y sin sesión se deja el destino por defecto.
  const deliveryHome = isDelivery ? '/deliveries' : undefined;

  // Mientras se lee la sesión guardada y su rol se mantiene el splash (no se muestra nada).
  if (isLoading) return null;

  return (
    <>
      {/* El carrito empuja toda la app (pestañas incluidas) hacia la izquierda; sin sesión o en
          modo repartidor no se abre. */}
      <CartDrawerView isEnabled={isSignedIn && !isDelivery}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* ---------- Con sesión: tienda (cualquier rol menos repartidor) ---------- */}
          <Stack.Protected guard={isSignedIn && !isDelivery} redirectTo={deliveryHome}>
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
            {/* Cuenta: pantallas propias de la tienda */}
            <Stack.Screen name="account/addresses/index" />
            <Stack.Screen name="account/addresses/new" />
            <Stack.Screen name="account/addresses/[id]" />
            <Stack.Screen name="account/payment-methods/index" />
            <Stack.Screen name="account/payment-methods/new" />
            <Stack.Screen name="account/payment-methods/[id]" />
            {/* Teléfono de contacto: lo pide el checkout de un delivery si falta */}
            <Stack.Screen name="account/phone" />
            {/* Bienvenida tras registrarse: ya hay sesión; sin volver */}
            <Stack.Screen
              name="auth/registered"
              options={{ gestureEnabled: false, animation: 'fade' }}
            />
          </Stack.Protected>

          {/* ---------- Con sesión: modo repartidor ---------- */}
          <Stack.Protected guard={isSignedIn && isDelivery}>
            <Stack.Screen name="(delivery)" />
            {/* Detalle de una entrega: misma hoja modal que el pedido del cliente */}
            <Stack.Screen name="delivery/[id]" options={{ presentation: 'modal' }} />
          </Stack.Protected>

          {/* ---------- Con sesión: cuenta, igual para los dos modos ---------- */}
          <Stack.Protected guard={isSignedIn}>
            {/* Pantallas internas de la cuenta: push con su propio encabezado (ScreenHeader) */}
            <Stack.Screen name="account/personal-info" />
            <Stack.Screen name="account/change-password" />
            <Stack.Screen name="account/notifications" />
          </Stack.Protected>

          {/* ---------- Sin sesión ---------- */}
          <Stack.Protected guard={!isSignedIn} redirectTo={deliveryHome}>
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
      {/* Con sesión y sin permiso de notificaciones: aviso para activarlas */}
      <NotificationsPromptView />
    </>
  );
}
