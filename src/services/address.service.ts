import { supabase } from '@/lib/supabase';
import type { Address, CreateAddressData, UpdateAddressData } from '@/models/address.model';
import type { Database } from '@/types/database';

type AddressRow = Database['public']['Tables']['addresses']['Row'];

/** Largo máximo del nombre (`addresses.label` es VARCHAR(50)). */
export const ADDRESS_LABEL_MAX_LENGTH = 50;

/** Código de Postgres cuando una fila está referenciada por otra (FK). */
const FOREIGN_KEY_VIOLATION = '23503';

function transformAddress(row: AddressRow): Address {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    isDefault: row.is_default ?? false,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

/** Id del usuario con sesión. Las consultas filtran por él: los admins pueden ver todas. */
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');
  return id;
}

export const addressService = {
  /** Direcciones del usuario: la predeterminada primero y luego las más recientes. */
  async getMine(): Promise<Address[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error('No pudimos cargar tus direcciones');
    return data.map(transformAddress);
  },

  /** Una dirección del usuario, o `null` si no existe. */
  async getById(id: string): Promise<Address | null> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error('No pudimos cargar la dirección');
    return data ? transformAddress(data) : null;
  },

  /** Crea una dirección. La primera del usuario queda como predeterminada. */
  async create(data: CreateAddressData): Promise<Address> {
    const userId = await currentUserId();
    const { count } = await supabase
      .from('addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    const { data: row, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        label: data.label,
        address_line_1: data.addressLine1,
        address_line_2: data.addressLine2,
        city: data.city,
        is_default: !count,
      })
      .select('*')
      .single();
    if (error) throw new Error('No pudimos guardar la dirección');
    return transformAddress(row);
  },

  /** Actualiza los datos de una dirección. */
  async update(id: string, data: UpdateAddressData): Promise<Address> {
    const userId = await currentUserId();
    const { data: row, error } = await supabase
      .from('addresses')
      .update({
        label: data.label,
        address_line_1: data.addressLine1,
        address_line_2: data.addressLine2,
        city: data.city,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();
    if (error) throw new Error('No pudimos guardar los cambios');
    if (!row) throw new Error('Esta dirección ya no existe');
    return transformAddress(row);
  },

  /**
   * Elimina una dirección. Si era la predeterminada, pasa a serlo la más reciente que quede.
   * Las direcciones usadas en un pedido no se pueden borrar (`orders.address_id` sin cascada).
   */
  async remove(id: string): Promise<void> {
    const userId = await currentUserId();
    const { data: removed, error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('is_default')
      .maybeSingle();
    if (error) {
      throw new Error(
        error.code === FOREIGN_KEY_VIOLATION
          ? 'No puedes eliminar una dirección que usaste en un pedido'
          : 'No pudimos eliminar la dirección',
      );
    }
    if (removed?.is_default) {
      const { data: next } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (next) await addressService.setDefault(next.id);
    }
  },

  /** Marca una dirección como predeterminada; el trigger de la base quita la marca a las demás. */
  async setDefault(id: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error('No pudimos cambiar la dirección predeterminada');
  },
};
