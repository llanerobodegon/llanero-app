import { supabase } from '@/lib/supabase';
import type { LocationImage } from '@/models/location.model';

/**
 * Imágenes de "Nuestras ubicaciones": las que el admin sube a la carpeta `locations` del bucket
 * público `admin-app`. Se listan al cargar, así que las nuevas aparecen sin cambiar la app.
 */
const BUCKET = 'admin-app';
const FOLDER = 'locations';

/** Proporción de las tarjetas (384 × 125). */
export const LOCATION_IMAGE_ASPECT_RATIO = 384 / 125;

const IMAGE_EXTENSION = /\.(png|jpe?g|webp)$/i;

export const locationService = {
  /** Imágenes de la carpeta, ordenadas por nombre (location-01, location-02…). */
  async getImages(): Promise<LocationImage[]> {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error('No pudimos cargar las ubicaciones');
    return (
      data
        // Deja fuera carpetas y el archivo vacío que Supabase crea en carpetas nuevas.
        .filter((file) => file.id && IMAGE_EXTENSION.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' }))
        .map((file) => ({
          id: file.id as string,
          name: file.name,
          imageUrl: supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${file.name}`).data
            .publicUrl,
        }))
    );
  },
};
