import { supabase } from '@/lib/supabase';
import { normalizeCase } from '@/lib/text';
import type { Warehouse } from '@/models/warehouse.model';
import type { Database } from '@/types/database';

type WarehouseRow = Database['public']['Tables']['warehouses']['Row'];

/** Fila de `warehouses` → modelo. */
function transformWarehouse(row: WarehouseRow): Warehouse {
  return {
    id: row.id,
    // El admin a veces los carga en MAYÚSCULAS: se muestran en formato título.
    name: normalizeCase(row.name),
    address: normalizeCase(row.address),
    phone: row.phone,
    logoUrl: row.logo_url,
    deliveryFee: Number(row.delivery_fee) || 0,
    isActive: row.is_active ?? true,
    isOpen: row.is_open ?? true,
  };
}

export const warehouseService = {
  /** Tiendas activas que el cliente puede elegir: abiertas primero y por nombre (RLS: requiere sesión). */
  async getActive(): Promise<Warehouse[]> {
    const { data, error } = await supabase.from('warehouses').select('*').eq('is_active', true);
    if (error) throw new Error('No pudimos cargar las tiendas');
    // Abiertas primero; dentro de cada grupo, por nombre (ya normalizado).
    return data
      .map(transformWarehouse)
      .sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || a.name.localeCompare(b.name, 'es'));
  },

  /**
   * Avisa cuando una tienda cambia (p. ej. abre o cierra desde la web), en tiempo real.
   * Devuelve cómo dejar de escuchar.
   */
  subscribeToChanges(onChange: () => void): () => void {
    const channel = supabase
      .channel(`warehouses-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'warehouses' }, () =>
        onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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
