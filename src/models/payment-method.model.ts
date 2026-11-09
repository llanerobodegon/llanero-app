import type { PaymentMethodType } from '@/models/order.model';
import type { IdType, PhoneCode } from '@/models/user.model';

/**
 * Método de pago guardado por el cliente para no reescribir sus datos al pagar.
 * OJO: aún no existe en Supabase. `payment_methods` de llanero-web son las cuentas de la
 * tienda (a dónde paga el cliente), no las del cliente. Los campos siguen esa tabla.
 */
export interface SavedPaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  /** Nombre corto que pone el cliente: "Mi Pago Móvil", "Banesco personal"… */
  alias: string;
  bank: string;
  phoneCode: PhoneCode;
  /** 7 dígitos, sin el código de operadora. */
  phoneNumber: string;
  documentType: IdType;
  documentNumber: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Datos del formulario de nuevo método de pago (por ahora solo Pago Móvil). */
export interface CreatePaymentMethodData {
  type: PaymentMethodType;
  alias: string;
  bank: string;
  phoneCode: PhoneCode;
  phoneNumber: string;
  documentType: IdType;
  documentNumber: string;
}
