import { Fragment } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { formatUSD } from '@/lib/format';
import type { CartItem } from '@/models/cart.model';

import { CartEmpty } from './cart-empty';
import { CartLine } from './cart-line';
import { TicketPerforation } from './ticket-perforation';

const INSET = 16;

type CartTicketProps = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** Color de fondo detrás del ticket (para las muescas). */
  backgroundColor: string;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
};

/**
 * Ticket del carrito (opción "B · Ticket con muescas"): líneas arriba con scroll, perforación
 * con muescas y totales abajo.
 */
export function CartTicket({
  items,
  itemCount,
  subtotal,
  backgroundColor,
  onIncrement,
  onDecrement,
}: CartTicketProps) {
  return (
    <View className="shrink rounded-3xl bg-surface">
      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <ScrollView
          className="shrink"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: INSET }}>
          {items.map((item, index) => (
            <Fragment key={item.productId}>
              <CartLine item={item} onIncrement={onIncrement} onDecrement={onDecrement} />
              {index < items.length - 1 ? <View className="h-3.5" /> : null}
            </Fragment>
          ))}
        </ScrollView>
      )}

      <TicketPerforation notchColor={backgroundColor} inset={INSET} />

      <View style={{ padding: INSET }} className="gap-1">
        {items.length > 0 ? (
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">{`Productos (${itemCount})`}</Text>
            <Text className="text-sm text-muted">{formatUSD(subtotal)}</Text>
          </View>
        ) : null}
        <View className="flex-row justify-between">
          <Text className="text-lg font-bold text-foreground">Subtotal</Text>
          <Text className="text-lg font-bold text-foreground">{formatUSD(subtotal)}</Text>
        </View>
      </View>
    </View>
  );
}
