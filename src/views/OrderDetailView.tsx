import { SymbolView } from 'expo-symbols';
import { Button, Chip, CloseButton, Skeleton, useThemeColor } from 'heroui-native';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetailRow, OrderDetailSection } from '@/components/order/order-detail-section';
import { OrderDeliveryCode } from '@/components/order/order-delivery-code';
import { OrderContact } from '@/components/order/order-contact';
import { OrderLines } from '@/components/order/order-lines';
import { OrderTimeline } from '@/components/order/order-timeline';
import { TicketPerforation } from '@/components/ticket-perforation';
import { formatBs, formatDateTime, formatUSD } from '@/lib/format';
import { useOrderDetailViewModel } from '@/viewmodels/useOrderDetailViewModel';

const TICKET_INSET = 16;

/** Detalle de un pedido, presentado como modal sobre las pestañas. */
export function OrderDetailView({ orderId }: { orderId: string }) {
  const vm = useOrderDetailViewModel(orderId);
  const insets = useSafeAreaInsets();
  const [foreground, background] = useThemeColor(['foreground', 'background']);
  const order = vm.order;

  // En iOS el modal es una hoja que no llega al borde superior; en Android ocupa la pantalla.
  const headerTop = Platform.OS === 'ios' ? 16 : insets.top + 8;

  return (
    <View className="flex-1 bg-background">
      {/* Encabezado: número y fecha a la izquierda, cerrar a la derecha (igual que el producto) */}
      <View style={{ paddingTop: headerTop }} className="flex-row items-center gap-3 px-4 pb-2">
        <View className="flex-1 gap-0.5 pl-1">
          <Text className="text-lg font-semibold text-foreground" accessibilityRole="header">
            {order ? `Pedido ${order.orderNumber}` : 'Detalle del pedido'}
          </Text>
          {order ? (
            <Text className="text-xs text-muted">{formatDateTime(order.createdAt)}</Text>
          ) : null}
        </View>
        <CloseButton
          onPress={vm.close}
          accessibilityLabel="Cerrar detalle"
          className="size-11 rounded-full bg-surface shadow-surface"
        />
      </View>

      {vm.isLoading ? (
        <View className="gap-4 px-4 pt-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </View>
      ) : !order ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base font-semibold text-foreground">
            {vm.error ?? 'No encontramos este pedido'}
          </Text>
          <Button
            size="md"
            feedbackVariant="scale"
            onPress={vm.retry}
            className="rounded-full bg-action px-6">
            <Button.Label className="text-action-foreground">Reintentar</Button.Label>
          </Button>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-5 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {/* Estado actual y seguimiento */}
          <View className="gap-4 rounded-3xl bg-surface p-4">
            <View className="gap-1.5">
              <Text className="text-xl font-bold text-foreground">{vm.statusLabel}</Text>
              <Text className="text-sm leading-5 text-muted">{vm.statusDescription}</Text>
            </View>

            {vm.isCancelled ? (
              order.cancellationReason ? (
                <View className="rounded-xl bg-danger/10 px-3 py-2.5">
                  <Text className="text-sm text-danger">{order.cancellationReason}</Text>
                </View>
              ) : null
            ) : (
              <OrderTimeline order={order} />
            )}
          </View>

          {vm.isActive ? (
            <OrderDeliveryCode code={order.deliveryCode} deliveryType={order.deliveryType} />
          ) : null}

          {/* Repartidor (si hay uno en camino) y la tienda como respaldo */}
          <OrderDetailSection title="Contacto">
            {vm.deliveryPerson ? (
              <>
                <OrderContact
                  name={`${vm.deliveryPerson.firstName} ${vm.deliveryPerson.lastName}`.trim()}
                  subtitle="Tu repartidor"
                  initials={vm.deliveryPersonInitials}
                  onPressWhatsApp={vm.contactDeliveryPerson}
                />
                <View className="h-px bg-border" />
              </>
            ) : null}
            <OrderContact
              name={order.warehouse.name}
              subtitle={
                vm.deliveryPerson
                  ? '¿Tu repartidor no responde? Escríbenos'
                  : '¿Dudas con tu pedido? Escríbenos'
              }
              onPressWhatsApp={vm.contactStore}
            />
          </OrderDetailSection>

          <OrderDetailSection title="Entrega">
            <View className="flex-row items-start gap-3">
              <View className="size-10 items-center justify-center rounded-full bg-default">
                <SymbolView
                  name={
                    vm.isDelivery
                      ? {
                          ios: 'scooter',
                          android: 'delivery_dining',
                          web: 'delivery_dining',
                        }
                      : {
                          ios: 'storefront',
                          android: 'storefront',
                          web: 'storefront',
                        }
                  }
                  size={18}
                  tintColor={foreground}
                />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-foreground">
                  {vm.isDelivery
                    ? `Delivery${order.address?.label ? ` a ${order.address.label}` : ''}`
                    : 'Retiro en tienda'}
                </Text>
                {vm.isDelivery && order.address ? (
                  <>
                    <Text className="text-sm text-muted">{order.address.address1}</Text>
                    {order.address.address2 ? (
                      <Text className="text-sm text-muted">{order.address.address2}</Text>
                    ) : null}
                    <Text className="text-sm text-muted">{order.address.city}</Text>
                  </>
                ) : null}
                {!vm.isDelivery && order.warehouse.address ? (
                  <Text className="text-sm text-muted">{order.warehouse.address}</Text>
                ) : null}
              </View>
            </View>
          </OrderDetailSection>

          {/* Productos como ticket, con la misma perforación que el carrito */}
          <View className="gap-2">
            <Text className="pl-1 text-sm font-semibold text-muted" accessibilityRole="header">
              Productos
            </Text>
            <View className="rounded-3xl bg-surface">
              <View style={{ padding: TICKET_INSET }}>
                <OrderLines items={order.items} />
              </View>
              <TicketPerforation notchColor={background} inset={TICKET_INSET} />
              <View style={{ padding: TICKET_INSET }} className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{`Productos (${vm.units})`}</Text>
                  <Text className="text-sm text-muted">{formatUSD(order.subtotalUsd)}</Text>
                </View>
                {vm.isDelivery ? (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Delivery</Text>
                    <Text className="text-sm text-muted">{formatUSD(order.deliveryFeeUsd)}</Text>
                  </View>
                ) : null}
                <View className="mt-1 flex-row justify-between">
                  <Text className="text-lg font-bold text-foreground">Total</Text>
                  <Text
                    className={`text-lg font-bold ${
                      vm.isCancelled ? 'text-muted line-through' : 'text-foreground'
                    }`}>
                    {formatUSD(order.totalUsd)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">
                    {`Tasa ${formatBs(order.exchangeRate)} por dólar`}
                  </Text>
                  <Text className="text-xs text-muted">{formatBs(order.totalBs)}</Text>
                </View>
              </View>
            </View>
          </View>

          <OrderDetailSection title="Pago">
            <DetailRow label="Método" value={vm.paymentMethodLabel} />
            {order.paymentBank ? <DetailRow label="Banco" value={order.paymentBank} /> : null}
            {order.paymentReference ? (
              <DetailRow label="Referencia" value={order.paymentReference} />
            ) : null}
            {vm.paymentStatus ? (
              <DetailRow
                label="Estado"
                value={
                  <Chip size="sm" variant="soft" color={vm.paymentStatus.color}>
                    {vm.paymentStatus.label}
                  </Chip>
                }
              />
            ) : null}
          </OrderDetailSection>

          {order.customerNotes ? (
            <OrderDetailSection title="Tus notas">
              <Text className="text-sm text-foreground">{order.customerNotes}</Text>
            </OrderDetailSection>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
