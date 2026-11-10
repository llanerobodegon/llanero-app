import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import { finalPrice } from '@/lib/format';
import type { Cart, CartItem } from '@/models/cart.model';
import type { Product } from '@/models/warehouse.model';
import { cartStorageService } from '@/services/cart-storage.service';

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
 * Se guarda en el teléfono por usuario y se restaura al abrir la app o iniciar sesión; si la
 * tienda del carrito guardado ya no está disponible, se descarta.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuthContext();
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouseContext();
  // Carrito guardado junto a su usuario: al cambiar de cuenta, el anterior deja de valer.
  const [state, setState] = useState<{ userId: string | null; cart: Cart }>({
    userId: null,
    cart: EMPTY_CART,
  });
  const cart = useMemo(
    () => (state.userId === userId ? state.cart : EMPTY_CART),
    [state.cart, state.userId, userId],
  );
  const [isOpen, setIsOpen] = useState(false);
  // Si el carrito ya se cargó para el usuario (para no guardar un carrito vacío encima).
  const isRestored = state.userId === userId && userId !== null;

  // Restaura el carrito guardado del usuario.
  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    cartStorageService
      .load(userId)
      .then((saved) => isActive && setState({ userId, cart: saved ?? EMPTY_CART }));
    return () => {
      isActive = false;
    };
  }, [userId]);

  // Guarda cada cambio (solo después de restaurar, para no pisar lo guardado).
  useEffect(() => {
    if (isRestored && userId) cartStorageService.save(userId, cart);
  }, [cart, isRestored, userId]);

  // Si la tienda del carrito ya no está disponible (inactiva o eliminada), se descarta.
  const cartWarehouseId = cart.warehouseId;
  const isCartWarehouseGone =
    isRestored &&
    !isLoadingWarehouses &&
    warehouses.length > 0 &&
    cartWarehouseId !== null &&
    !warehouses.some((warehouse) => warehouse.id === cartWarehouseId);
  useEffect(() => {
    if (!isCartWarehouseGone || !userId) return;
    let isActive = true;
    // Asíncrono para no cambiar el estado dentro del efecto de forma síncrona.
    Promise.resolve().then(() => isActive && setState({ userId, cart: EMPTY_CART }));
    return () => {
      isActive = false;
    };
  }, [isCartWarehouseGone, userId]);

  /** Cambia el carrito del usuario actual. */
  const setCart = useCallback(
    (update: (current: Cart) => Cart) => {
      if (!userId) return;
      setState((current) => ({
        userId,
        cart: update(current.userId === userId ? current.cart : EMPTY_CART),
      }));
    },
    [userId],
  );

  const addProduct = useCallback(
    (product: Product, warehouseId: string, quantity = 1) => {
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
    },
    [setCart],
  );

  const increment = useCallback(
    (productId: string) => {
      setCart((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      }));
    },
    [setCart],
  );

  /** Baja una unidad; en 1 quita la línea. */
  const decrement = useCallback(
    (productId: string) => {
      setCart((current) => ({
        ...current,
        items: current.items
          .map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      }));
    },
    [setCart],
  );

  const clear = useCallback(() => setCart(() => EMPTY_CART), [setCart]);
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
