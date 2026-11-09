import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { finalPrice } from '@/lib/format';
import type { Cart, CartItem } from '@/models/cart.model';
import type { Product } from '@/models/warehouse.model';

interface CartContextType {
  warehouseId: string | null;
  items: CartItem[];
  /** Total de unidades (suma de cantidades). */
  itemCount: number;
  subtotal: number;
  addProduct: (product: Product, warehouseId: string, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  /** Drawer del carrito. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART: Cart = { warehouseId: null, items: [] };

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrls[0] ?? null,
    unitPrice: finalPrice(product.price, product.isOnDiscount, product.discountPrice),
    quantity,
  };
}

/**
 * Carrito de la tienda elegida y estado del drawer.
 * TODO: guardar y restaurar el carrito en el dispositivo (ver
 * docs/superpowers/specs/2026-11-09-cart-drawer-design.md, "Persistencia").
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isOpen, setIsOpen] = useState(false);

  const addProduct = useCallback((product: Product, warehouseId: string, quantity = 1) => {
    setCart((current) => {
      // El carrito pertenece a una sola tienda; si llega otra, empieza de cero.
      const items = current.warehouseId === warehouseId ? current.items : [];
      const existing = items.find((item) => item.productId === product.id);
      return {
        warehouseId,
        items: existing
          ? items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...items, toCartItem(product, quantity)],
      };
    });
  }, []);

  const increment = useCallback((productId: string) => {
    setCart((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    }));
  }, []);

  /** Baja una unidad; en 1 quita la línea. */
  const decrement = useCallback((productId: string) => {
    setCart((current) => ({
      ...current,
      items: current.items
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  const clear = useCallback(() => setCart(EMPTY_CART), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextType>(() => {
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return {
      warehouseId: cart.warehouseId,
      items: cart.items,
      itemCount,
      subtotal,
      addProduct,
      increment,
      decrement,
      clear,
      isOpen,
      open,
      close,
    };
  }, [cart, isOpen, addProduct, increment, decrement, clear, open, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
