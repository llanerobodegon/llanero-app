/**
 * Línea del carrito: una "foto" del producto suficiente para pintar el ticket sin consultar.
 * `unitPrice` es el precio final (con descuento si aplica) al agregarlo.
 */
export interface CartItem {
  productId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

/** Carrito de una sola tienda. */
export interface Cart {
  warehouseId: string | null;
  items: CartItem[];
}
