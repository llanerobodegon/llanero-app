import { supabase } from '@/lib/supabase';
import type { Slider } from '@/models/slider.model';
import type { Database } from '@/types/database';

type SliderRow = Database['public']['Tables']['sliders']['Row'];

/** Posiciones de slider que define la tabla `sliders`. */
export const SliderPosition = {
  main: 1,
  secondary: 2,
} as const;

function transformSlider(row: SliderRow): Slider {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    slot: row.slot,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    isActive: row.is_active ?? true,
    createdBy: row.created_by,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export const sliderService = {
  /**
   * Slides activos de una posición, ordenados por slot. Si la posición está apagada en
   * `slider_settings` (desde la web), no devuelve ninguno.
   */
  async getActiveByPosition(position: number): Promise<Slider[]> {
    const [{ data: setting }, { data, error }] = await Promise.all([
      supabase.from('slider_settings').select('is_enabled').eq('position', position).maybeSingle(),
      supabase
        .from('sliders')
        .select('*')
        .eq('is_active', true)
        .eq('position', position)
        .order('slot'),
    ]);
    if (error) throw new Error('No pudimos cargar los banners');
    if (setting && setting.is_enabled === false) return [];
    return data.map(transformSlider);
  },
};
