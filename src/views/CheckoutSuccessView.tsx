import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button, Skeleton, useThemeColor } from 'heroui-native';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { OrderLines } from '@/components/order/order-lines';
import { ScreenHeader } from '@/components/screen-header';
import { TicketPerforation } from '@/components/ticket-perforation';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { formatBs, formatDateTime, formatUSD } from '@/lib/format';
import { getPaymentMethodLabel } from '@/lib/order-status';
import { useCheckoutSuccessViewModel } from '@/viewmodels/useCheckoutSuccessViewModel';
import { CHECKOUT_STEPS } from '@/viewmodels/useCheckoutViewModel';

const TICKET_INSET = 16;
/** Proporción de `assets/images/llanero-logo.png` (3245 × 1046). */
const LOGO_ASPECT_RATIO = 3245 / 1046;
const LOGO_HEIGHT = 28;

/** Fila etiqueta / valor del ticket. */
function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="shrink text-right text-sm font-medium text-foreground" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/** Checkout, paso 3 (resultado): confirmación del pedido y accesos a verlo o seguir comprando. */
export function CheckoutSuccessView({ orderId }: { orderId: string }) {
  const vm = useCheckoutSuccessViewModel(orderId);
  const insets = useSafeAreaInsets();
  const actionForeground = useActionForeground();
  const [foreground, background] = useThemeColor(['foreground', 'background']);
  const scheme = useColorScheme();
  const order = vm.order;

  return (
    <View className="flex-1 bg-background">
      {/* "Atrás" aquí cierra el checkout: el pago ya está hecho. */}
      <ScreenHeader title="Finalizar pedido" onBack={vm.keepShopping} />
      <View className="pb-3 pt-1">
        <CheckoutSteps steps={CHECKOUT_STEPS} current={2} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 px-4 pt-2 pb-6">
        {/* Comprobante como ticket: logo y confirmación, detalles y total */}
        <View className="rounded-3xl bg-surface">
          <View style={{ padding: TICKET_INSET }} className="items-center gap-3 pt-6">
            <Image
              source={require('@/assets/images/llanero-logo.png')}
              contentFit="contain"
              // El vino del logo no contrasta con el fondo oscuro: ahí va en monocromo.
              tintColor={scheme === 'dark' ? foreground : undefined}
              style={{ width: LOGO_HEIGHT * LOGO_ASPECT_RATIO, height: LOGO_HEIGHT }}
              accessibilityLabel="Llanero"
            />
            <View className="mt-2 size-14 items-center justify-center rounded-full bg-action">
              <SymbolView
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                size={24}
                weight="bold"
                tintColor={actionForeground}
              />
            </View>
            <Text className="text-center text-xl font-bold text-foreground">
              ¡Recibimos tu pedido!
            </Text>
            {vm.isLoading ? (
              <Skeleton className="h-4 w-40 rounded-md" />
            ) : order ? (
              <Text className="text-center text-sm font-semibold text-foreground">
                {`${order.orderNumber} · ${vm.statusLabel}`}
              </Text>
            ) : null}
            <Text className="text-center text-sm leading-5 text-muted">
              {vm.statusDescription ||
                'Estamos verificando tu pago y te avisaremos cuando lo confirmemos.'}
            </Text>
          </View>

          {order ? (
            <>
              <TicketPerforation notchColor={background} inset={TICKET_INSET} />

              {/* Detalles */}
              <View style={{ padding: TICKET_INSET }} className="gap-2.5">
                <TicketRow label="Fecha" value={formatDateTime(order.createdAt)} />
                <TicketRow label="Tienda" value={order.warehouse.name} />
                <TicketRow
                  label="Entrega"
                  value={
                    order.deliveryType === 'delivery'
                      ? `Delivery${order.address?.label ? ` a ${order.address.label}` : ''}`
                      : 'Retiro en tienda'
                  }
                />
                <TicketRow label="Pago" value={getPaymentMethodLabel(order.paymentMethodType)} />
                {order.paymentReference ? (
                  <TicketRow label="Referencia" value={order.paymentReference} />
                ) : null}
              </View>

              <TicketPerforation notchColor={background} inset={TICKET_INSET} />

              {/* Productos y total */}
              <View style={{ padding: TICKET_INSET }} className="gap-3">
                <OrderLines items={order.items} />
                <View className="gap-1">
                  {order.deliveryType === 'delivery' ? (
                    <TicketRow label="Delivery" value={formatUSD(order.deliveryFeeUsd)} />
                  ) : null}
                  <View className="flex-row items-baseline justify-between">
                    <Text className="text-lg font-bold text-foreground">Total</Text>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-foreground">
                        {formatUSD(order.totalUsd)}
                      </Text>
                      <Text className="text-xs text-muted">{formatBs(order.totalBs)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 12 }} className="gap-2 px-4 pt-3">
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          onPress={vm.viewOrder}
          className="rounded-full bg-action">
          <Button.Label className="text-action-foreground">Ver mi pedido</Button.Label>
        </Button>
        <Button size="lg" variant="ghost" onPress={vm.keepShopping} className="rounded-full">
          <Button.Label className="text-action">Seguir comprando</Button.Label>
        </Button>
      </View>
    </View>
  );
}
