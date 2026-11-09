import { SymbolView } from 'expo-symbols';
import { Button, PressableFeedback, Skeleton, useThemeColor } from 'heroui-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeliveryTypeOption } from '@/components/checkout/delivery-type-option';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { EmptyState } from '@/components/empty-state';
import { OptionsSheet } from '@/components/options-sheet';
import { ScreenHeader } from '@/components/screen-header';
import { TicketPerforation } from '@/components/ticket-perforation';
import { formatUSD } from '@/lib/format';
import type { Address } from '@/models/address.model';
import { CHECKOUT_STEPS, useCheckoutViewModel } from '@/viewmodels/useCheckoutViewModel';

const TICKET_INSET = 16;
/** Alto máximo de la lista de productos del resumen (unas 6 líneas) antes de hacer scroll. */
const ITEMS_MAX_HEIGHT = 190;

/** Dirección en una línea: "Av. Lara con calle 5, Casa 12, Barquisimeto". */
const addressSummary = (address: Address) =>
  [address.addressLine1, address.addressLine2, address.city].filter(Boolean).join(', ');

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="pl-1 text-sm font-semibold text-muted" accessibilityRole="header">
      {children}
    </Text>
  );
}

/** Checkout, paso 1 (detalles del pedido): resumen, tipo de entrega y dirección o tienda. */
export function CheckoutView() {
  const vm = useCheckoutViewModel();
  const insets = useSafeAreaInsets();
  const [foreground, background, muted] = useThemeColor(['foreground', 'background', 'muted']);

  if (vm.isEmpty) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title="Finalizar pedido" onBack={vm.goBack} />
        <EmptyState
          icon={{ ios: 'cart', android: 'shopping_cart' }}
          title="Tu carrito está vacío"
          description="Agrega productos para hacer un pedido."
          actionLabel="Volver"
          onPressAction={vm.goBack}
        />
      </View>
    );
  }

  const { summary } = vm;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Finalizar pedido" onBack={vm.goBack} />

      <View className="pb-3 pt-1">
        <CheckoutSteps steps={CHECKOUT_STEPS} current={vm.currentStep} />
      </View>

      {/* Resumen del pedido, como ticket (igual que el carrito). Ocupa el espacio que deja el pie. */}
      <View className="shrink px-4 pt-2">
        <View className="shrink gap-2">
          <SectionTitle>Resumen del pedido</SectionTitle>
          <View className="shrink rounded-3xl bg-surface">
            {/* Productos con altura máxima y scroll, para que la entrega quede siempre visible */}
            <ScrollView
              className="shrink"
              style={{ maxHeight: ITEMS_MAX_HEIGHT }}
              showsVerticalScrollIndicator={summary.items.length > 5}
              contentContainerClassName="gap-1.5"
              contentContainerStyle={{ padding: TICKET_INSET }}>
              {summary.items.map((item) => (
                <View key={item.productId} className="flex-row gap-2">
                  <Text
                    className="w-7 text-sm font-semibold text-foreground"
                    style={{ fontVariant: ['tabular-nums'] }}>
                    {`${item.quantity}×`}
                  </Text>
                  <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-muted">
                    {formatUSD(item.unitPrice * item.quantity)}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TicketPerforation notchColor={background} inset={TICKET_INSET} />
            <View style={{ padding: TICKET_INSET }} className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">{`Productos (${summary.itemCount})`}</Text>
                <Text className="text-sm text-muted">{formatUSD(summary.subtotal)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Delivery</Text>
                <Text className="text-sm text-muted">
                  {vm.isDelivery ? formatUSD(summary.deliveryFee) : 'Gratis'}
                </Text>
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-lg font-bold text-foreground">Total</Text>
                <Text className="text-lg font-bold text-foreground">
                  {formatUSD(summary.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Pie fijo: entrega, dirección o tienda, total y continuar (siempre visibles) */}
      <View
        style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
        className="mt-auto gap-5 px-4 pt-4">
        {/* Información de entrega */}
        <View className="gap-2">
          <SectionTitle>Entrega</SectionTitle>
          <View className="flex-row gap-3" accessibilityRole="radiogroup">
            <DeliveryTypeOption
              title="Delivery"
              detail={
                vm.warehouseDeliveryFee > 0 ? `+${formatUSD(vm.warehouseDeliveryFee)}` : 'Gratis'
              }
              icon={{ ios: 'scooter', android: 'delivery_dining' }}
              isSelected={vm.isDelivery}
              onPress={() => vm.selectDeliveryType('delivery')}
            />
            <DeliveryTypeOption
              title="Retiro en tienda"
              detail="Gratis"
              icon={{ ios: 'storefront', android: 'storefront' }}
              isSelected={!vm.isDelivery}
              onPress={() => vm.selectDeliveryType('pickup')}
            />
          </View>
        </View>

        {vm.isDelivery ? (
          // Dirección de entrega: la elegida (predeterminada al entrar) o agregar una.
          <View className="gap-2">
            {/* Título y, a la derecha, un enlace pequeño para agregar otra dirección */}
            <View className="flex-row items-center justify-between pr-1">
              <SectionTitle>Dirección de entrega</SectionTitle>
              {vm.selectedAddress ? (
                <Pressable
                  onPress={vm.addAddress}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Agregar otra dirección"
                  className="active:opacity-60">
                  <Text className="text-xs font-medium text-action">+ Nueva</Text>
                </Pressable>
              ) : null}
            </View>
            {vm.isLoadingAddresses ? (
              <Skeleton className="h-16 w-full rounded-3xl" />
            ) : vm.selectedAddress ? (
              <PressableFeedback
                onPress={vm.openAddressSheet}
                accessibilityRole="button"
                accessibilityLabel={`Dirección: ${vm.selectedAddress.label}, ${addressSummary(vm.selectedAddress)}`}
                accessibilityHint="Toca para elegir otra dirección"
                className="flex-row items-center gap-3 rounded-3xl bg-surface p-3">
                <View className="size-10 items-center justify-center rounded-full bg-default">
                  <SymbolView
                    name={{
                      ios: 'mappin.and.ellipse',
                      android: 'location_on',
                      web: 'location_on',
                    }}
                    size={18}
                    tintColor={foreground}
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {vm.selectedAddress.label}
                  </Text>
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {addressSummary(vm.selectedAddress)}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-action">Cambiar</Text>
              </PressableFeedback>
            ) : (
              <PressableFeedback
                onPress={vm.addAddress}
                accessibilityRole="button"
                accessibilityLabel="Agregar una dirección de entrega"
                className="flex-row items-center gap-3 rounded-3xl border-2 border-dashed border-default bg-surface p-3">
                <View className="size-10 items-center justify-center rounded-full bg-default">
                  <SymbolView
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={18}
                    tintColor={foreground}
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground">
                    Agrega una dirección
                  </Text>
                  <Text className="text-xs text-muted">
                    {vm.addressesError ?? 'La necesitamos para llevarte tu pedido.'}
                  </Text>
                </View>
              </PressableFeedback>
            )}
          </View>
        ) : (
          // Retiro: la tienda del carrito, fija.
          <View className="gap-2">
            <SectionTitle>Tienda de retiro</SectionTitle>
            <View className="gap-3 rounded-3xl bg-surface p-3">
              <View className="flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-full bg-default">
                  <SymbolView
                    name={{ ios: 'storefront', android: 'storefront', web: 'storefront' }}
                    size={18}
                    tintColor={foreground}
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {vm.warehouse?.name ?? 'Tienda'}
                  </Text>
                  {vm.warehouse?.address ? (
                    <Text className="text-xs text-muted">{vm.warehouse.address}</Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center gap-2 rounded-2xl bg-default px-3 py-2">
                <SymbolView
                  name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                  size={12}
                  tintColor={muted}
                />
                <Text className="flex-1 text-xs text-muted">
                  Es la tienda de tu carrito, por eso no se puede cambiar.
                </Text>
              </View>
            </View>
          </View>
        )}
        <View className="flex-row items-baseline justify-between px-1">
          <Text className="text-sm text-muted">Total a pagar</Text>
          <Text className="text-xl font-bold text-foreground">{formatUSD(summary.total)}</Text>
        </View>
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          isDisabled={!vm.canContinue}
          onPress={vm.continueToPayment}
          className="rounded-full bg-action">
          <Button.Label className="text-action-foreground">Continuar al pago</Button.Label>
        </Button>
      </View>

      <OptionsSheet
        isOpen={vm.isAddressSheetOpen}
        onClose={vm.closeAddressSheet}
        title="Elige la dirección"
        description="¿A dónde te llevamos tu pedido?"
        options={vm.addresses}
        keyExtractor={(address) => address.id}
        isSelected={(address) => address.id === vm.selectedAddress?.id}
        onSelect={vm.selectAddress}
        getAccessibilityLabel={(address) => `${address.label}, ${addressSummary(address)}`}
        renderOption={(address) => (
          <>
            <Text className="text-base font-medium text-foreground" numberOfLines={1}>
              {address.label}
            </Text>
            <Text className="text-sm text-muted" numberOfLines={1}>
              {addressSummary(address)}
            </Text>
          </>
        )}
        isScrollable={vm.addresses.length > 6}
      />
    </View>
  );
}
