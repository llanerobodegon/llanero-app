import type { Warehouse } from '@/models/warehouse.model';

// TODO: reemplazar por la consulta a Supabase (`warehouses` con is_active = true)
// cuando se conecte el cliente. La firma de los métodos no debe cambiar.
const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'mock-1',
    name: 'Bodegón Centro',
    address: 'Av. Principal, Centro',
    phone: null,
    logoUrl: null,
    deliveryFee: 2,
    isActive: true,
    isOpen: true,
  },
  {
    id: 'mock-2',
    name: 'Bodegón Norte',
    address: 'C.C. Las Palmas, Local 4',
    phone: null,
    logoUrl: null,
    deliveryFee: 3,
    isActive: true,
    isOpen: true,
  },
  {
    id: 'mock-3',
    name: 'Bodegón Este',
    address: 'Calle 5 con Av. Bolívar',
    phone: null,
    logoUrl: null,
    deliveryFee: 2.5,
    isActive: true,
    isOpen: false,
  },
];

export const warehouseService = {
  /** Tiendas activas que el cliente puede elegir, ordenadas por nombre. */
  async getActive(): Promise<Warehouse[]> {
    return MOCK_WAREHOUSES.filter((w) => w.isActive).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  },
};
