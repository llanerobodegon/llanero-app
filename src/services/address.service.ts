import type { Address, CreateAddressData } from '@/models/address.model';

// TODO: reemplazar el mock por Supabase cuando exista la sesión:
//   getMine: supabase.from('addresses').select('*').eq('user_id', userId)
//     .order('is_default', { ascending: false }).order('created_at', { ascending: false })
//   create:  supabase.from('addresses').insert({ user_id, label, address_line_1,
//     address_line_2, city, is_default }).select().single()
// Las firmas no deben cambiar.

/** Direcciones guardadas en memoria mientras no hay Supabase (se pierden al cerrar la app). */
let mockAddresses: Address[] = [];

export const addressService = {
  /** Direcciones del usuario; la predeterminada primero. */
  async getMine(): Promise<Address[]> {
    return [...mockAddresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  },

  /** Crea una dirección. La primera del usuario queda como predeterminada. */
  async create(data: CreateAddressData): Promise<Address> {
    const now = new Date().toISOString();
    const address: Address = {
      ...data,
      id: `mock-address-${Date.now()}`,
      userId: 'mock-user-1',
      isDefault: mockAddresses.length === 0,
      createdAt: now,
      updatedAt: now,
    };
    mockAddresses = [address, ...mockAddresses];
    return address;
  },
};
