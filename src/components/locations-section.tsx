import type { Warehouse } from '@/models/warehouse.model';

import { ImageRowSection } from './image-row-section';

/** Ancho de cada logo; el alto sale de la proporción 2:1 (140 × 70). */
const LOGO_WIDTH = 140;

type LocationsSectionProps = {
  title?: string;
  warehouses: Warehouse[];
  isLoading?: boolean;
  onPressWarehouse?: (warehouse: Warehouse) => void;
};

/** Fila horizontal de logos 2:1, uno por tienda. */
export function LocationsSection({
  title = 'Nuestras ubicaciones',
  warehouses,
  isLoading = false,
  onPressWarehouse,
}: LocationsSectionProps) {
  // TODO: confirmar qué imagen usa cada ubicación; por ahora `logoUrl` de la tienda.
  const items = warehouses.map((warehouse) => ({
    id: warehouse.id,
    imageUrl: warehouse.logoUrl,
    label: warehouse.address ? `${warehouse.name}, ${warehouse.address}` : warehouse.name,
    warehouse,
  }));

  return (
    <ImageRowSection
      title={title}
      items={items}
      itemWidth={LOGO_WIDTH}
      contentFit="contain"
      isLoading={isLoading}
      onPressItem={onPressWarehouse ? (item) => onPressWarehouse(item.warehouse) : undefined}
    />
  );
}
