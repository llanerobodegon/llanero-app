import { EmptyState } from '@/components/empty-state';

/** Estado vacío dentro del ticket del carrito. */
export function CartEmpty() {
  return (
    <EmptyState
      icon={{ ios: 'cart', android: 'shopping_cart' }}
      title="Tu carrito está vacío"
      description="Toca el + en cualquier producto para agregarlo."
      // Menos aire que en una pantalla completa: va dentro del ticket.
      className="py-8"
    />
  );
}
