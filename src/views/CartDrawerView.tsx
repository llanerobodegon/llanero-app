import { Button, CloseButton, LinkButton, useThemeColor } from 'heroui-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartTicket } from '@/components/cart/cart-ticket';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatUSD } from '@/lib/format';
import { useCartViewModel } from '@/viewmodels/useCartViewModel';

/**
 * Drawer del carrito: entra por la derecha y empuja la app (`drawerType="slide"`).
 * Envuelve toda la app (incluidas las pestañas) desde `src/app/_layout.tsx`.
 */
export function CartDrawerView({
  children,
  isEnabled = true,
}: {
  children: ReactNode;
  /** `false` sin sesión: no se puede abrir el carrito deslizando. */
  isEnabled?: boolean;
}) {
  const vm = useCartViewModel();
  const [background] = useThemeColor(['background']);

  return (
    <Drawer
      open={vm.isOpen}
      onOpen={vm.handleDrawerOpen}
      onClose={vm.close}
      drawerPosition="right"
      drawerType="slide"
      swipeEnabled={isEnabled}
      drawerStyle={{ width: '86%', backgroundColor: background }}
      renderDrawerContent={() => <CartContent background={background} />}>
      {children}
    </Drawer>
  );
}

function CartContent({ background }: { background: string }) {
  const vm = useCartViewModel();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
      className="flex-1 gap-4 px-4">
      <View className="flex-row items-center justify-between gap-3 pl-1">
        <View className="flex-1 flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-foreground" accessibilityRole="header">
            Tu carrito
          </Text>
          {vm.itemCount > 0 ? (
            <Text className="text-sm text-muted">
              {vm.itemCount === 1 ? '1 producto' : `${vm.itemCount} productos`}
            </Text>
          ) : null}
        </View>
        {!vm.isEmpty ? (
          <LinkButton onPress={vm.requestClear} accessibilityLabel="Vaciar carrito">
            <LinkButton.Label className="text-danger">Vaciar</LinkButton.Label>
          </LinkButton>
        ) : null}
        {/* Cierre explícito: no todos pueden (o saben) deslizar para cerrar. */}
        <CloseButton
          onPress={vm.close}
          accessibilityLabel="Cerrar carrito"
          className="size-11 rounded-full bg-surface shadow-surface"
        />
      </View>

      {/* Productos quitados al actualizar precios porque la tienda ya no los tiene */}
      {vm.removedUnavailableCount > 0 ? (
        <View className="flex-row items-center gap-3 rounded-2xl bg-warning/15 px-3 py-2.5">
          <Text className="flex-1 text-sm text-foreground" accessibilityLiveRegion="polite">
            {vm.removedUnavailableCount === 1
              ? 'Quitamos 1 producto que ya no está disponible en esta tienda.'
              : `Quitamos ${vm.removedUnavailableCount} productos que ya no están disponibles en esta tienda.`}
          </Text>
          <CloseButton
            onPress={vm.dismissRemovedNotice}
            accessibilityLabel="Cerrar aviso"
            className="size-7"
          />
        </View>
      ) : null}

      <CartTicket
        items={vm.items}
        itemCount={vm.itemCount}
        subtotal={vm.subtotal}
        backgroundColor={background}
        onIncrement={vm.increment}
        onDecrement={vm.decrement}
      />

      <Button
        size="lg"
        // Sin capa de color al presionar sobre el color de acción.
        feedbackVariant="scale"
        isDisabled={vm.isEmpty}
        onPress={vm.checkout}
        className="mt-auto rounded-full bg-action">
        <Button.Label className="text-action-foreground">
          {vm.isEmpty ? 'Pagar' : `Pagar · ${formatUSD(vm.subtotal)}`}
        </Button.Label>
      </Button>

      {/* Tienda cerrada: se puede armar el pedido, pero no pagarlo */}
      <ConfirmDialog
        isOpen={vm.isClosedNoticeOpen}
        title={`${vm.closedWarehouseName} está cerrada`}
        description="Puedes seguir armando tu pedido, pero podrás pagarlo cuando la tienda abra."
        confirmLabel="Entendido"
        hideCancel
        onConfirm={vm.closeClosedNotice}
        onCancel={vm.closeClosedNotice}
      />

      <ConfirmDialog
        isOpen={vm.isClearConfirmOpen}
        title="¿Vaciar el carrito?"
        description="Se quitarán todos los productos de tu carrito."
        confirmLabel="Vaciar"
        tone="danger"
        onConfirm={vm.confirmClear}
        onCancel={vm.cancelClear}
      />
    </View>
  );
}
