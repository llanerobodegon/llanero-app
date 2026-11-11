import { Skeleton, useThemeColor } from 'heroui-native';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailabilitySwitch } from '@/components/delivery/availability-switch';
import { DeliveryCard } from '@/components/delivery/delivery-card';
import { EmptyState } from '@/components/empty-state';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useDeliveriesViewModel } from '@/viewmodels/useDeliveriesViewModel';

const SKELETON_COUNT = 3;

/** Pestaña inicial del modo repartidor: disponibilidad y entregas pendientes. */
export function DeliveriesView() {
  const vm = useDeliveriesViewModel();
  const insets = useSafeAreaInsets();
  const [accent] = useThemeColor(['accent']);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + Spacing.two }}>
      <View className="gap-4 px-4 pb-3">
        <Text className="pl-1 text-3xl font-bold text-foreground" accessibilityRole="header">
          Entregas
        </Text>

        {vm.isLoading ? (
          <Skeleton className="h-20 rounded-3xl" />
        ) : (
          <View className="gap-2">
            <AvailabilitySwitch
              availability={vm.availability}
              isUpdating={vm.isUpdatingAvailability}
              onToggle={vm.toggleAvailability}
            />
            {vm.availabilityError ? (
              <Text className="pl-1 text-sm text-danger" accessibilityLiveRegion="polite">
                {vm.availabilityError}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {vm.isLoading ? (
        <View className="gap-3 px-4 pt-1">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-3xl" />
          ))}
        </View>
      ) : (
        <FlatList
          data={vm.error ? [] : vm.deliveries}
          keyExtractor={(delivery) => delivery.id}
          renderItem={({ item }) => <DeliveryCard delivery={item} onPress={vm.openDelivery} />}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Spacing.three,
            paddingTop: Spacing.one,
            // Zona segura inferior + alto de la tabbar + aire, para que nada quede bajo la barra.
            paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
          }}
          refreshControl={
            <RefreshControl
              refreshing={vm.isRefreshing}
              onRefresh={vm.refresh}
              tintColor={accent}
              colors={[accent]}
            />
          }
          ListEmptyComponent={
            vm.error ? (
              <EmptyState
                icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
                title="No pudimos cargar tus entregas"
                description={vm.error}
                actionLabel="Reintentar"
                onPressAction={vm.retry}
              />
            ) : (
              <EmptyState
                icon={{ ios: 'shippingbox', android: 'local_shipping' }}
                title="No tienes entregas pendientes"
                description="Cuando el bodegón te asigne un pedido aparecerá aquí."
              />
            )
          }
        />
      )}
    </View>
  );
}
