import type { Address, CreateAddressData, UpdateAddressData } from '@/models/address.model';

// TODO: reemplazar el mock por Supabase cuando exista la sesión:
//   getMine: supabase.from('addresses').select('*').eq('user_id', userId)
//     .order('is_default', { ascending: false }).order('created_at', { ascending: false })
//   create:  supabase.from('addresses').insert({ user_id, label, address_line_1,
//     address_line_2, city, is_default }).select().single()
//   update:  supabase.from('addresses').update({ ... }).eq('id', id).select().single()
//   remove:  supabase.from('addresses').delete().eq('id', id)
//   setDefault: quitar `is_default` a las demás del usuario y ponerlo en esta (idealmente
//     en una función RPC para que sea atómico).
// Las firmas no deben cambiar.

const MOCK_DATE = '2026-11-01T00:00:00.000Z';

/**
 * Direcciones guardadas en memoria mientras no hay Supabase (se pierden al cerrar la app).
 * Arranca con una de ejemplo para ver la lista cargada; deja el arreglo vacío para ver el
 * estado vacío.
 */
let mockAddresses: Address[] = [
  {
    id: 'mock-address-1',
    userId: 'mock-user-1',
    label: 'Casa',
    addressLine1: 'Av. Lara con calle 5, Urb. del Este',
    addressLine2: 'Casa 12, frente a la plaza',
    city: 'Barquisimeto',
    isDefault: true,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
];

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

  /** Una dirección del usuario, o `null` si no existe. */
  async getById(id: string): Promise<Address | null> {
    return mockAddresses.find((address) => address.id === id) ?? null;
  },

  /** Actualiza los datos de una dirección. */
  async update(id: string, data: UpdateAddressData): Promise<Address> {
    const current = mockAddresses.find((address) => address.id === id);
    if (!current) throw new Error('Esta dirección ya no existe');
    const updated: Address = { ...current, ...data, updatedAt: new Date().toISOString() };
    mockAddresses = mockAddresses.map((address) => (address.id === id ? updated : address));
    return updated;
  },

  /** Elimina una dirección. Si era la predeterminada, pasa a serlo la más reciente que quede. */
  async remove(id: string): Promise<void> {
    const removed = mockAddresses.find((address) => address.id === id);
    mockAddresses = mockAddresses.filter((address) => address.id !== id);
    if (removed?.isDefault && mockAddresses.length > 0) {
      mockAddresses = mockAddresses.map((address, index) => ({
        ...address,
        isDefault: index === 0,
      }));
    }
  },

  /** Marca una dirección como predeterminada (y quita la marca a las demás). */
  async setDefault(id: string): Promise<void> {
    mockAddresses = mockAddresses.map((address) => ({ ...address, isDefault: address.id === id }));
  },
};
