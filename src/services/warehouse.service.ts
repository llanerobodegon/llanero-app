import { supabase } from '@/lib/supabase';
import type { Warehouse } from '@/models/warehouse.model';
import type { Database } from '@/types/database';

type WarehouseRow = Database['public']['Tables']['warehouses']['Row'];

/** Fila de `warehouses` → modelo. */
function transformWarehouse(row: WarehouseRow): Warehouse {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    logoUrl: row.logo_url,
    deliveryFee: Number(row.delivery_fee) || 0,
    isActive: row.is_active ?? true,
    isOpen: row.is_open ?? true,
  };
}

export const warehouseService = {
  /** Tiendas activas que el cliente puede elegir, ordenadas por nombre (RLS: requiere sesión). */
  async getActive(): Promise<Warehouse[]> {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw new Error('No pudimos cargar las tiendas');
    return data.map(transformWarehouse);
  },

  /** Tienda que el cliente eligió la última vez (`users.preferred_warehouse_id`), si hay. */
  async getPreferredId(): Promise<string | null> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return null;
    const { data } = await supabase
      .from('users')
      .select('preferred_warehouse_id')
      .eq('id', userId)
      .maybeSingle();
    return data?.preferred_warehouse_id ?? null;
  },

  /** Guarda la tienda elegida para la próxima vez. Si falla, no interrumpe al cliente. */
  async setPreferred(warehouseId: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return;
    await supabase.from('users').update({ preferred_warehouse_id: warehouseId }).eq('id', userId);
  },
};
