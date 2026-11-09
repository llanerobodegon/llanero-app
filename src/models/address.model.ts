// Mismos nombres que llanero-web/src/models/user.model.ts (tabla `addresses`).

export interface Address {
  id: string;
  userId: string;
  /** Nombre corto que pone el cliente: "Casa", "Oficina"… */
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Datos del formulario de nueva dirección. */
export interface CreateAddressData {
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
}
