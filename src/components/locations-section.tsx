import type { LocationImage } from '@/models/location.model';

import { ImageRowSection } from './image-row-section';

/** Ancho de cada tarjeta; el alto sale de su proporción. */
const CARD_WIDTH = 260;

type LocationsSectionProps = {
  title?: string;
  images: LocationImage[];
  /** Proporción ancho / alto de las tarjetas. */
  aspectRatio: number;
  isLoading?: boolean;
};

/** Fila horizontal con las tarjetas de nuestras ubicaciones (imágenes cargadas desde la web). */
export function LocationsSection({
  title = 'Nuestras ubicaciones',
  images,
  aspectRatio,
  isLoading = false,
}: LocationsSectionProps) {
  const items = images.map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    label: `Ubicación: ${image.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' ')}`,
  }));

  return (
    <ImageRowSection
      title={title}
      items={items}
      itemWidth={CARD_WIDTH}
      aspectRatio={aspectRatio}
      // La tarjeta ya trae su diseño: llena el espacio (misma proporción, sin recorte).
      contentFit="cover"
      isLoading={isLoading}
    />
  );
}
