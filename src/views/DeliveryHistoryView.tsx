import { Skeleton, Spinner, useThemeColor } from 'heroui-native';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeliveryCard } from '@/components/delivery/delivery-card';
import { DeliverySummary } from '@/components/delivery/delivery-summary';
import { EmptyState } from '@/components/empty-state';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useDeliveryHistoryViewModel } from '@/viewmodels/useDeliveryHistoryViewModel';

const SKELETON_COUNT = 3;

/** Historial del repartidor: resumen y pedidos entregados. */
export function DeliveryHistoryView() {
  const vm = useDeliveryHistoryViewModel();
  const insets = useSafeAreaInsets();
  const [accent] = useThemeColor(['accent']);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + Spacing.two }}>
      <View className="gap-4 px-4 pb-3">
        <Text className="pl-1 text-3xl font-bold text-foreground" accessibilityRole="header">
          Historial
        </Text>
        {vm.isLoading ? (
          <Skeleton className="h-24 rounded-3xl" />
        ) : vm.error ? null : (
          <DeliverySummary summary={vm.summary} />
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
          onEndReached={vm.loadMore}
          onEndReachedThreshold={0.4}
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
          ListFooterComponent={
            vm.isLoadingMore ? (
              <View className="items-center py-4">
                <Spinner size="sm" />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            vm.error ? (
              <EmptyState
                icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
                title="No pudimos cargar tu historial"
                description={vm.error}
                actionLabel="Reintentar"
                onPressAction={vm.retry}
              />
            ) : (
              <EmptyState
                icon={{ ios: 'clock.arrow.circlepath', android: 'history' }}
                title="Aún no tienes entregas"
                description="Tus pedidos entregados aparecerán aquí."
              />
            )
          }
        />
      )}
    </View>
  );
}
