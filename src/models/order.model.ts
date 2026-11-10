// Mismos nombres que llanero-web/src/services/orders.service.ts (tablas `orders` y `order_items`).
// Solo los campos que ve el cliente: sin datos del cliente, notas internas ni cuenta bancaria.

export type OrderStatus = 'pending' | 'confirmed' | 'on_delivery' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethodType = 'pago_movil' | 'transferencia' | 'zelle' | 'banesco_panama';

/** Línea del pedido: "foto" del producto al momento de comprar. */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPriceUsd: number;
  unitPriceBs: number;
  totalUsd: number;
  totalBs: number;
}

export interface OrderWarehouse {
  id: string;
  name: string;
  address: string | null;
  /** Texto libre (`warehouses.phone`, hasta 15 caracteres), p. ej. "0424-1234567". */
  phone: string | null;
}

export interface OrderAddress {
  id: string;
  label: string | null;
  address1: string;
  address2: string | null;
  city: string;
}

/**
 * Repartidor asignado (`orders.delivery_person_id` → `users`). La web solo trae el nombre;
 * aquí se suma el teléfono para escribirle por WhatsApp.
 */
export interface OrderDeliveryPerson {
  id: string;
  firstName: string;
  lastName: string;
  /** 7 dígitos, sin el código de operadora. */
  phone: string | null;
  /** Código de operadora: '0412', '0414', '0416', '0422', '0424' o '0426'. */
  phoneCode: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  warehouse: OrderWarehouse;
  address: OrderAddress | null;
  deliveryPerson: OrderDeliveryPerson | null;
  deliveryType: DeliveryType;
  /** Código de 4 dígitos que el cliente le da al repartidor (o en tienda) al recibir. */
  deliveryCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethodType: PaymentMethodType;
  paymentBank: string | null;
  paymentReference: string | null;
  subtotalUsd: number;
  subtotalBs: number;
  deliveryFeeUsd: number;
  deliveryFeeBs: number;
  totalUsd: number;
  totalBs: number;
  exchangeRate: number;
  customerNotes: string | null;
  confirmedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

/** Producto y cantidad al crear el pedido (el precio lo calcula la base). */
export interface CreateOrderItemData {
  productId: string;
  quantity: number;
}

/**
 * Datos para crear un pedido desde el checkout. La función `create_order` de la base calcula
 * precios, descuentos, costo de delivery y totales; la app no los envía.
 */
export interface CreateOrderData {
  warehouseId: string;
  deliveryType: DeliveryType;
  /** Solo con delivery. */
  addressId: string | null;
  paymentMethodType: PaymentMethodType;
  /** Cuenta de la tienda a la que se pagó (`orders.bank_account_id`). */
  bankAccountId: string;
  /** Banco desde donde pagó el cliente. */
  paymentBank: string | null;
  paymentReference: string;
  /** Bolívares por dólar usados para los montos en Bs. */
  exchangeRate: number;
  items: CreateOrderItemData[];
  customerNotes?: string | null;
}
