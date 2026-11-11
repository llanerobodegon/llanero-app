import { SymbolView } from 'expo-symbols';
import { Button, CloseButton, Skeleton, useThemeColor } from 'heroui-native';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DeliveryCodeSheet } from '@/components/delivery/delivery-code-sheet';
import { DeliveryItems } from '@/components/delivery/delivery-items';
import { DeliveryStatusChip } from '@/components/delivery/delivery-status-chip';
import { OrderContact } from '@/components/order/order-contact';
import { OrderDetailSection } from '@/components/order/order-detail-section';
import { formatDateTime } from '@/lib/format';
import { useDeliveryDetailViewModel } from '@/viewmodels/useDeliveryDetailViewModel';

/** Detalle de una entrega del repartidor, presentado como modal sobre las pestañas. */
export function DeliveryDetailView({ orderId }: { orderId: string }) {
  const vm = useDeliveryDetailViewModel(orderId);
  const insets = useSafeAreaInsets();
  const [foreground] = useThemeColor(['foreground']);
  const delivery = vm.delivery;

  // En iOS el modal es una hoja que no llega al borde superior; en Android ocupa la pantalla.
  const headerTop = Platform.OS === 'ios' ? 16 : insets.top + 8;
  const status = delivery?.status;
  const hasAction = status === 'confirmed' || status === 'on_delivery' || status === 'pending';

  return (
    <View className="flex-1 bg-background">
      {/* Encabezado: número y fecha a la izquierda, cerrar a la derecha (igual que el pedido) */}
      <View style={{ paddingTop: headerTop }} className="flex-row items-center gap-3 px-4 pb-2">
        <View className="flex-1 gap-0.5 pl-1">
          <Text className="text-lg font-semibold text-foreground" accessibilityRole="header">
            {delivery ? `Pedido ${delivery.orderNumber}` : 'Detalle de la entrega'}
          </Text>
          {delivery ? (
            <Text className="text-xs text-muted">{formatDateTime(delivery.createdAt)}</Text>
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
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </View>
      ) : vm.isNotFound ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base font-semibold text-foreground">
            Este pedido ya no está asignado a ti
          </Text>
          <Button
            size="md"
            feedbackVariant="scale"
            onPress={vm.close}
            className="rounded-full bg-action px-6">
            <Button.Label className="text-action-foreground">Volver a entregas</Button.Label>
          </Button>
        </View>
      ) : !delivery ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base font-semibold text-foreground">
            {vm.error ?? 'No pudimos cargar la entrega'}
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
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-5 px-4 pt-3"
            contentContainerStyle={{ paddingBottom: hasAction ? 24 : insets.bottom + 24 }}>
            {/* Estado actual y qué toca hacer */}
            <View className="gap-3 rounded-3xl bg-surface p-4">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="shrink text-xl font-bold text-foreground">{vm.statusLabel}</Text>
                <DeliveryStatusChip status={delivery.status} />
              </View>
              <Text className="text-sm leading-5 text-muted">{vm.statusDescription}</Text>
              {delivery.status === 'completed' && delivery.deliveredAt ? (
                <Text className="text-sm font-medium text-foreground">
                  {`Entregado el ${formatDateTime(delivery.deliveredAt)}`}
                </Text>
              ) : null}
              {vm.notice ? (
                <View className="rounded-xl bg-danger/10 px-3 py-2.5">
                  <Text className="text-sm text-danger" accessibilityLiveRegion="polite">
                    {vm.notice}
                  </Text>
                </View>
              ) : null}
            </View>

            <OrderDetailSection title="Retirar en">
              <View className="flex-row items-start gap-3">
                <View className="size-10 items-center justify-center rounded-full bg-default">
                  <SymbolView
                    name={{ ios: 'storefront', android: 'storefront', web: 'storefront' }}
                    size={18}
                    tintColor={foreground}
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground">
                    {delivery.warehouse.name}
                  </Text>
                  {delivery.warehouse.address ? (
                    <Text className="text-sm text-muted">{delivery.warehouse.address}</Text>
                  ) : null}
                </View>
              </View>
              <View className="h-px bg-border" />
              <Text className="text-xs font-semibold text-muted">
                {vm.units === 1 ? '1 producto' : `${vm.units} productos`}
              </Text>
              <DeliveryItems items={delivery.items} />
            </OrderDetailSection>

            <OrderDetailSection title="Entregar a">
              <OrderContact
                name={vm.customerName}
                subtitle="Cliente"
                initials={vm.customerInitials || undefined}
                onPressCall={vm.callCustomer}
                onPressWhatsApp={vm.whatsAppCustomer}
              />
              {vm.hasNoCustomerPhone ? (
                <Text className="text-sm text-muted">
                  Este cliente no tiene un teléfono registrado. Si necesitas ubicarlo, contacta al
                  bodegón.
                </Text>
              ) : null}
              {delivery.isContactHidden ? (
                <Text className="text-sm text-muted">
                  Los datos de contacto ya no están disponibles.
                </Text>
              ) : delivery.address ? (
                <>
                  <View className="h-px bg-border" />
                  <View className="flex-row items-start gap-3">
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
                      {delivery.address.label ? (
                        <Text className="text-sm font-semibold text-foreground">
                          {delivery.address.label}
                        </Text>
                      ) : null}
                      <Text className="text-sm text-muted">{delivery.address.address1}</Text>
                      {delivery.address.address2 ? (
                        <Text className="text-sm text-muted">{delivery.address.address2}</Text>
                      ) : null}
                      <Text className="text-sm text-muted">{delivery.address.city}</Text>
                    </View>
                  </View>
                  {vm.openMap ? (
                    <Button
                      variant="secondary"
                      size="md"
                      feedbackVariant="scale"
                      onPress={vm.openMap}
                      className="rounded-full">
                      <Button.Label>Abrir en mapas</Button.Label>
                    </Button>
                  ) : null}
                </>
              ) : (
                <Text className="text-sm text-muted">Este pedido no tiene dirección.</Text>
              )}
            </OrderDetailSection>

            {delivery.customerNotes ? (
              <OrderDetailSection title="Notas del cliente">
                <Text className="text-sm text-foreground">{delivery.customerNotes}</Text>
              </OrderDetailSection>
            ) : null}

            <OrderDetailSection title="¿Problemas con la entrega?">
              <OrderContact
                name={delivery.warehouse.name}
                subtitle="Contacta al bodegón y lo resolvemos"
                onPressCall={vm.callStore}
                onPressWhatsApp={vm.whatsAppStore}
              />
            </OrderDetailSection>
          </ScrollView>

          {/* Acción principal fija abajo, según el estado */}
          {hasAction ? (
            <View
              className="border-t border-border bg-background px-4 pt-3"
              style={{ paddingBottom: insets.bottom + 12 }}>
              {status === 'pending' ? (
                <Text className="py-2 text-center text-sm text-muted">
                  Esperando la confirmación del pago
                </Text>
              ) : status === 'confirmed' ? (
                <Button
                  size="lg"
                  feedbackVariant="scale"
                  onPress={vm.requestPickUp}
                  isDisabled={vm.isSubmitting}
                  className="rounded-full bg-action">
                  <Button.Label className="text-action-foreground">Retiré el pedido</Button.Label>
                </Button>
              ) : vm.isLocked ? (
                <Text className="py-2 text-center text-sm text-danger">
                  Se agotaron los intentos. Contacta al bodegón para completar la entrega
                </Text>
              ) : (
                <Button
                  size="lg"
                  feedbackVariant="scale"
                  onPress={vm.openCodeSheet}
                  isDisabled={vm.isSubmitting}
                  className="rounded-full bg-action">
                  <Button.Label className="text-action-foreground">Entregar</Button.Label>
                </Button>
              )}
            </View>
          ) : null}
        </>
      )}

      <DeliveryCodeSheet
        isOpen={vm.isCodeSheetOpen}
        attemptsLeft={vm.attemptsLeft}
        error={vm.codeError}
        isSubmitting={vm.isSubmitting}
        onSubmit={vm.submitCode}
        onClose={vm.closeCodeSheet}
      />

      <ConfirmDialog
        isOpen={vm.isPickUpDialogOpen}
        title="¿Retiraste el pedido?"
        description="El cliente verá que su pedido va en camino."
        confirmLabel="Sí, lo retiré"
        isLoading={vm.isSubmitting}
        loadingLabel="Guardando…"
        errorMessage={vm.pickUpError}
        onConfirm={vm.confirmPickUp}
        onCancel={vm.cancelPickUp}
      />
    </View>
  );
}
