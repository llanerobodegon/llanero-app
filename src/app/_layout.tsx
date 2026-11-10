import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
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
        <WarehouseProvider>
          <CartProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AnimatedSplashOverlay />
              {/* El carrito empuja toda la app (pestañas incluidas) hacia la izquierda */}
              <CartDrawerView>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  {/* Bienvenida: sin gesto de volver (se llega con replace al cerrar sesión) */}
                  <Stack.Screen
                    name="auth/index"
                    options={{ gestureEnabled: false, animation: 'fade' }}
                  />
                  {/* Formulario de email: push normal desde la bienvenida */}
                  <Stack.Screen name="auth/login" />
                  {/* Detalle de producto: hoja modal por encima de las pestañas */}
                  <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
                  {/* Detalle de pedido: misma hoja modal que el producto */}
                  <Stack.Screen name="order/[id]" options={{ presentation: 'modal' }} />
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
                </Stack>
              </CartDrawerView>
            </ThemeProvider>
          </CartProvider>
        </WarehouseProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
