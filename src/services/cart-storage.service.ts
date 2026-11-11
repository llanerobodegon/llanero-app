import type { Cart, CartItem } from '@/models/cart.model';

/**
 * Carrito guardado en el teléfono, por usuario (el `localStorage` de expo-sqlite, el mismo
 * que guarda la sesión). Es local a propósito: el carrito es de este dispositivo.
 */
const keyFor = (userId: string) => `llanero.cart.${userId}`;

const isCartItem = (value: unknown): value is CartItem => {
  const item = value as CartItem;
  return (
    !!item &&
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.unitPrice === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
};

export const cartStorageService = {
  /** Carrito guardado del usuario, o `null` si no hay (o está dañado). */
  async load(userId: string): Promise<Cart | null> {
    try {
      const raw = localStorage.getItem(keyFor(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Cart>;
      const items = Array.isArray(parsed.items) ? parsed.items.filter(isCartItem) : [];
      if (typeof parsed.warehouseId !== 'string' || items.length === 0) return null;
      return { warehouseId: parsed.warehouseId, items };
    } catch {
      return null;
    }
  },

  /** Guarda el carrito; si está vacío, borra lo guardado. */
  async save(userId: string, cart: Cart): Promise<void> {
    try {
      if (cart.items.length === 0) localStorage.removeItem(keyFor(userId));
      else localStorage.setItem(keyFor(userId), JSON.stringify(cart));
    } catch {
      // Si no se pudo guardar, el carrito sigue en memoria hasta cerrar la app.
    }
  },
};
