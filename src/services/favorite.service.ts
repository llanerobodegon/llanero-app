import { supabase } from '@/lib/supabase';

/**
 * Favoritos del cliente en la tabla `favorites` (RLS: cada uno solo ve, agrega y quita los
 * suyos). Antes se guardaban en el teléfono; `migrateLocal` sube esos una vez y los borra.
 */

/** Clave donde la versión anterior guardaba los favoritos en el teléfono. */
const localKeyFor = (userId: string) => `llanero.favorites.${userId}`;

export const favoriteService = {
  /** Ids de los productos favoritos del usuario, del más reciente al más antiguo. */
  async getIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error('No pudimos cargar tus favoritos');
    return data.map((row) => row.product_id);
  },

  /** Agrega un favorito (si ya existía, no pasa nada). */
  async add(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .upsert(
        { user_id: userId, product_id: productId },
        { onConflict: 'user_id,product_id', ignoreDuplicates: true },
      );
    if (error) throw new Error('No pudimos guardar el favorito');
  },

  /** Quita un favorito. */
  async remove(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw new Error('No pudimos quitar el favorito');
  },

  /**
   * Sube a la base los favoritos que la versión anterior guardó en el teléfono y los borra de
   * ahí. Si falla, se reintenta en la próxima apertura.
   */
  async migrateLocal(userId: string): Promise<void> {
    let ids: string[] = [];
    try {
      const raw = localStorage.getItem(localKeyFor(userId));
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      ids = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : [];
    } catch {
      return;
    }
    if (ids.length === 0) return;
    const { error } = await supabase.from('favorites').upsert(
      ids.map((productId) => ({ user_id: userId, product_id: productId })),
      { onConflict: 'user_id,product_id', ignoreDuplicates: true },
    );
    if (!error) localStorage.removeItem(localKeyFor(userId));
  },
};
