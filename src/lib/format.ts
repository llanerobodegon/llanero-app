/** Precio en dólares con dos decimales: 16 → "$16.00". */
export function formatUSD(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Porcentaje de descuento redondeado: (20, 16) → 20. */
export function discountPercent(price: number, discountPrice: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

/** Precio final: el de descuento si el producto está en descuento, si no el normal. */
export function finalPrice(
  price: number,
  isOnDiscount: boolean,
  discountPrice: number | null,
): number {
  return isOnDiscount && discountPrice !== null ? discountPrice : price;
}
