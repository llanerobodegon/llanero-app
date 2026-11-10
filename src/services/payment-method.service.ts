import type {
  CreatePaymentMethodData,
  SavedPaymentMethod,
  UpdatePaymentMethodData,
} from '@/models/payment-method.model';

// TODO: definir con la web la tabla de métodos de pago del cliente (no existe todavía) y
// reemplazar el mock. `setDefault` debería ser atómico en Supabase (función RPC).
// Las firmas no deben cambiar.

/** Métodos guardados en memoria mientras no hay Supabase (se pierden al cerrar la app). */
let mockPaymentMethods: SavedPaymentMethod[] = [];

export const paymentMethodService = {
  /** Métodos de pago guardados del usuario; el predeterminado primero. */
  async getMine(): Promise<SavedPaymentMethod[]> {
    return [...mockPaymentMethods].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  },

  /** Un método de pago del usuario, o `null` si no existe. */
  async getById(id: string): Promise<SavedPaymentMethod | null> {
    return mockPaymentMethods.find((method) => method.id === id) ?? null;
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

  /** Actualiza los datos de un método de pago. */
  async update(id: string, data: UpdatePaymentMethodData): Promise<SavedPaymentMethod> {
    const current = mockPaymentMethods.find((method) => method.id === id);
    if (!current) throw new Error('Este método de pago ya no existe');
    const updated: SavedPaymentMethod = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockPaymentMethods = mockPaymentMethods.map((method) => (method.id === id ? updated : method));
    return updated;
  },

  /** Elimina un método. Si era el predeterminado, pasa a serlo el más reciente que quede. */
  async remove(id: string): Promise<void> {
    const removed = mockPaymentMethods.find((method) => method.id === id);
    mockPaymentMethods = mockPaymentMethods.filter((method) => method.id !== id);
    if (removed?.isDefault && mockPaymentMethods.length > 0) {
      mockPaymentMethods = mockPaymentMethods.map((method, index) => ({
        ...method,
        isDefault: index === 0,
      }));
    }
  },

  /** Marca un método como predeterminado (y quita la marca a los demás). */
  async setDefault(id: string): Promise<void> {
    mockPaymentMethods = mockPaymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }));
  },
};
