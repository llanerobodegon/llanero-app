import type { CreatePaymentMethodData, SavedPaymentMethod } from '@/models/payment-method.model';

// TODO: definir con la web la tabla de métodos de pago del cliente (no existe todavía) y
// reemplazar el mock. Las firmas no deben cambiar.

/** Métodos guardados en memoria mientras no hay Supabase (se pierden al cerrar la app). */
let mockPaymentMethods: SavedPaymentMethod[] = [];

export const paymentMethodService = {
  /** Métodos de pago guardados del usuario; el predeterminado primero. */
  async getMine(): Promise<SavedPaymentMethod[]> {
    return [...mockPaymentMethods].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  },

  /** Guarda un método de pago. El primero del usuario queda como predeterminado. */
  async create(data: CreatePaymentMethodData): Promise<SavedPaymentMethod> {
    const now = new Date().toISOString();
    const method: SavedPaymentMethod = {
      ...data,
      id: `mock-payment-method-${Date.now()}`,
      userId: 'mock-user-1',
      isDefault: mockPaymentMethods.length === 0,
      createdAt: now,
      updatedAt: now,
    };
    mockPaymentMethods = [method, ...mockPaymentMethods];
    return method;
  },
};
