import { SymbolView } from 'expo-symbols';
import { Skeleton, Switch, useThemeColor } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';

import { NotificationTopics } from '@/components/notifications/notification-topics';
import { ScreenHeader } from '@/components/screen-header';
import { useActionColor } from '@/hooks/use-action-foreground';
import { useNotificationsViewModel } from '@/viewmodels/useNotificationsViewModel';

/** Notificaciones: interruptor general y los tipos de avisos que se reciben. */
export function NotificationsView() {
  const vm = useNotificationsViewModel();
  const [foreground, defaultColor] = useThemeColor(['foreground', 'default']);
  const actionColor = useActionColor();

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Notificaciones" onBack={vm.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 px-4 pt-4 pb-6">
        {vm.isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-52 w-full rounded-3xl" />
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-3 rounded-3xl bg-surface p-4">
              <View className="size-10 items-center justify-center rounded-full bg-default">
                <SymbolView
                  name={
                    vm.isEnabled
                      ? {
                          ios: 'bell.badge',
                          android: 'notifications_active',
                          web: 'notifications_active',
                        }
                      : {
                          ios: 'bell.slash',
                          android: 'notifications_off',
                          web: 'notifications_off',
                        }
                  }
                  size={18}
                  tintColor={foreground}
                />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-foreground">Notificaciones</Text>
                <Text className="text-xs text-muted">
                  {vm.isEnabled ? 'Activadas en este teléfono' : 'Desactivadas'}
                </Text>
              </View>
              <Switch
                isSelected={vm.isEnabled}
                onSelectedChange={vm.toggle}
                isDisabled={vm.isUpdating}
                accessibilityLabel="Notificaciones"
                // Pista del color de acción al activarse (vino en claro, naranja en oscuro).
                animation={{ backgroundColor: { value: [defaultColor, actionColor] } }}
              />
            </View>

            <NotificationTopics isEnabled={vm.isEnabled} />

            {vm.error ? <Text className="text-sm text-danger">{vm.error}</Text> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
