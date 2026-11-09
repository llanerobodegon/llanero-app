import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { CartProvider } from '@/contexts/cart-context';
import { WarehouseProvider } from '@/contexts/warehouse-context';
import { CartDrawerView } from '@/views/CartDrawerView';

SplashScreen.preventAutoHideAsync();

// @gorhom/bottom-sheet (vía heroui-native) pasa deps a hooks de Reanimated; en native se ignoran y es inofensivo.
LogBox.ignoreLogs(['[Reanimated] Dependencies should only be used on the web']);

export default function TabLayout() {
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
                <AppTabs />
              </CartDrawerView>
            </ThemeProvider>
          </CartProvider>
        </WarehouseProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
