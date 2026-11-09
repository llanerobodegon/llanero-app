import { Skeleton, Tabs, useThemeColor } from 'heroui-native';
import { RefreshControl, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/order/order-card';
import { OrdersEmpty } from '@/components/order/orders-empty';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useOrdersViewModel } from '@/viewmodels/useOrdersViewModel';

const SKELETON_COUNT = 3;

export function OrdersView() {
  const vm = useOrdersViewModel();
  const insets = useSafeAreaInsets();
  const [accent] = useThemeColor(['accent']);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + Spacing.two }}>
      <View className="gap-4 px-4 pb-3">
        <Text className="pl-1 text-3xl font-bold text-foreground" accessibilityRole="header">
          Pedidos
        </Text>

        <Tabs value={vm.tab} onValueChange={vm.selectTab}>
          <Tabs.List className="w-full">
            <Tabs.Indicator />
            <Tabs.Trigger value="active" className="flex-1">
              <Tabs.Label>
                {vm.activeCount > 0 ? `En curso (${vm.activeCount})` : 'En curso'}
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="history" className="flex-1">
              <Tabs.Label>Historial</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </View>

      {vm.isLoading ? (
        <View className="gap-3 px-4 pt-1">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-3xl" />
          ))}
        </View>
      ) : (
        <Animated.FlatList
          data={vm.error ? [] : vm.visibleOrders}
          keyExtractor={(order) => order.id}
          // Las tarjetas de abajo se desplazan suavemente al expandir/contraer una.
          itemLayoutAnimation={LinearTransition.duration(220)}
          extraData={vm.expandedOrderId}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              isExpanded={vm.expandedOrderId === item.id}
              onToggle={vm.toggleOrder}
              onPressDetail={vm.openOrder}
            />
          )}
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
              <OrdersEmpty
                icon="warning"
                title="No pudimos cargar tus pedidos"
                description={vm.error}
                actionLabel="Reintentar"
                onPressAction={vm.retry}
              />
            ) : vm.tab === 'active' ? (
              <OrdersEmpty
                icon="bag"
                title="No tienes pedidos en curso"
                description="Cuando hagas un pedido, aquí podrás seguir su estado hasta que te llegue."
                actionLabel="Ir a comprar"
                onPressAction={vm.goShopping}
              />
            ) : (
              <OrdersEmpty
                icon="clock"
                title="Aún no tienes pedidos anteriores"
                description="Tus pedidos entregados y cancelados aparecerán aquí."
              />
            )
          }
        />
      )}
    </View>
  );
}
