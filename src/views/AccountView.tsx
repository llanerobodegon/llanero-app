import { Image } from 'expo-image';
import { useThemeColor } from 'heroui-native';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenuItem, AccountMenuSection } from '@/components/account/account-menu';
import { AccountGreeting } from '@/components/account/account-greeting';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAccountViewModel } from '@/viewmodels/useAccountViewModel';

/** Proporción de `assets/images/llanero-logo.png` (3245 × 1046). */
const LOGO_ASPECT_RATIO = 3245 / 1046;
const LOGO_HEIGHT = 24;

export function AccountView() {
  const vm = useAccountViewModel();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const [muted] = useThemeColor(['muted']);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + Spacing.two }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 px-4"
        // Zona segura inferior + alto de la tabbar + aire, para que nada quede bajo la barra.
        contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset + Spacing.five }}>
        <Text className="pl-1 text-3xl font-bold text-foreground" accessibilityRole="header">
          Cuenta
        </Text>

        {vm.error ? (
          <View className="rounded-3xl bg-surface p-4">
            <Text className="text-sm text-danger">{vm.error}</Text>
          </View>
        ) : (
          <AccountGreeting
            firstName={vm.firstName}
            email={vm.maskedEmail}
            initials={vm.initials}
            isLoading={vm.isLoading}
          />
        )}

        <AccountMenuSection title="Mi cuenta">
          <AccountMenuItem
            title="Información personal"
            icon={{ ios: 'person', android: 'person' }}
            onPress={vm.openPersonalInfo}
          />
          <AccountMenuItem
            title="Administrar direcciones"
            icon={{ ios: 'mappin.and.ellipse', android: 'location_on' }}
            onPress={vm.openAddresses}
          />
          <AccountMenuItem
            title="Métodos de pago"
            icon={{ ios: 'creditcard', android: 'credit_card' }}
            onPress={vm.openPaymentMethods}
          />
          <AccountMenuItem
            title="Cambiar contraseña"
            icon={{ ios: 'lock', android: 'lock' }}
            onPress={vm.openChangePassword}
          />
        </AccountMenuSection>

        <AccountMenuSection title="Preferencias">
          <AccountMenuItem
            title="Notificaciones"
            icon={{ ios: 'bell', android: 'notifications' }}
            onPress={vm.openNotifications}
          />
        </AccountMenuSection>

        <AccountMenuSection title="Legal">
          <AccountMenuItem
            title="Términos y condiciones"
            icon={{ ios: 'doc.text', android: 'description' }}
            onPress={vm.openTerms}
          />
          <AccountMenuItem
            title="Políticas de privacidad"
            icon={{ ios: 'hand.raised', android: 'shield' }}
            onPress={vm.openPrivacy}
          />
        </AccountMenuSection>

        <AccountMenuSection>
          <AccountMenuItem
            title="Cerrar sesión"
            icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout' }}
            showChevron={false}
            onPress={vm.requestLogout}
          />
          <AccountMenuItem
            title="Eliminar cuenta"
            icon={{ ios: 'trash', android: 'delete' }}
            tone="danger"
            showChevron={false}
            onPress={vm.requestDeleteAccount}
          />
        </AccountMenuSection>

        {/* Pie: logo pequeño y versión */}
        <View className="items-center gap-2 pt-2">
          <Image
            source={require('@/assets/images/llanero-logo.png')}
            contentFit="contain"
            // El vino del logo no contrasta con el fondo oscuro: ahí va en monocromo gris.
            tintColor={scheme === 'dark' ? muted : undefined}
            style={{ width: LOGO_HEIGHT * LOGO_ASPECT_RATIO, height: LOGO_HEIGHT }}
            accessibilityLabel="Llanero"
          />
          <Text className="text-xs text-muted">{`Versión ${vm.appVersion}`}</Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        isOpen={vm.pendingAction === 'logout'}
        title="¿Cerrar sesión?"
        description="Tendrás que volver a iniciar sesión para hacer pedidos."
        confirmLabel="Cerrar sesión"
        onConfirm={vm.confirmPendingAction}
        onCancel={vm.cancelPendingAction}
      />
      <ConfirmDialog
        isOpen={vm.pendingAction === 'delete'}
        title="¿Eliminar tu cuenta?"
        description="Se borrarán tus datos y direcciones. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={vm.confirmPendingAction}
        onCancel={vm.cancelPendingAction}
      />
    </View>
  );
}
