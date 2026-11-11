// Modo repartidor. Lo que devuelven las funciones del servidor (`get_delivery_orders`,
// `get_delivery_order`, …): solo lo que el repartidor necesita. Nunca el código de entrega,
// montos ni datos de pago.

import type { OrderStatus } from '@/models/order.model';

/** `users.delivery_status`: lo que ve el admin en la web para asignar pedidos. */
export type DeliveryAvailability = 'available' | 'on_delivery' | 'unavailable';

/** Entrega en una lista (pendientes o historial). */
export interface DeliveryListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  warehouseName: string;
  customerName: string;
  addressLine1: string | null;
  city: string | null;
  /** Unidades totales del pedido. */
  itemCount: number;
  createdAt: string;
  deliveredAt: string | null;
}

/** Producto a verificar al retirar: sin precios. */
export interface DeliveryItem {
  id: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
}

export interface DeliveryWarehouse {
  name: string;
  address: string | null;
  /** Texto libre (`warehouses.phone`), p. ej. "0424-1234567". */
  phone: string | null;
}

export interface DeliveryCustomer {
  firstName: string;
  lastName: string;
  /** Código de operadora ('0412', '0424'…); `null` si no tiene o el contacto ya se ocultó. */
  phoneCode: string | null;
  /** 7 dígitos, sin el código de operadora. */
  phone: string | null;
}

export interface DeliveryAddress {
  label: string | null;
  address1: string;
  address2: string | null;
  city: string;
}

/** Detalle de una entrega asignada al repartidor. */
export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  customerNotes: string | null;
  /** Intentos que quedan para escribir el código (máximo 5). */
  attemptsLeft: number;
  /** Pasadas 24 h de la entrega, el teléfono y la dirección del cliente ya no se devuelven. */
  isContactHidden: boolean;
  warehouse: DeliveryWarehouse;
  customer: DeliveryCustomer;
  address: DeliveryAddress | null;
  items: DeliveryItem[];
}

/** Resumen del historial. */
export interface DeliverySummary {
  today: number;
  last7Days: number;
}

/** Resultado de escribir el código de entrega. */
export interface CompleteDeliveryResult {
  isCompleted: boolean;
  attemptsLeft: number;
}
