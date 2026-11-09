import type { Product } from '@/models/warehouse.model';

// TODO: reemplazar los mocks por consultas a Supabase cuando se conecte el cliente. Todas parten
// de `warehouse_products` filtrado por warehouse_id = tienda elegida e is_available = true, con
// join a `products` (is_active = true). El precio de la tienda (`warehouse_products.price`)
// reemplaza al base si no es null. Las firmas no deben cambiar.

type MockProduct = Pick<
  Product,
  'name' | 'description' | 'price' | 'isOnDiscount' | 'isPromo' | 'discountPrice'
>;

const MOCK_DATE = '2026-11-01T00:00:00.000Z';

const MOCK_PROMOS: MockProduct[] = [
  {
    name: 'Harina PAN Blanca',
    description: '1 kg',
    price: 1.6,
    isOnDiscount: true,
    isPromo: true,
    discountPrice: 1.28,
  },
  {
    name: 'Café Fama de América',
    description: '500 g',
    price: 6.5,
    isOnDiscount: false,
    isPromo: true,
    discountPrice: null,
  },
  {
    name: 'Queso Blanco Llanero',
    description: '1 kg',
    price: 7.2,
    isOnDiscount: true,
    isPromo: true,
    discountPrice: 6.12,
  },
  {
    name: 'Malta Polar',
    description: 'Pack 6 x 250 ml',
    price: 4.8,
    isOnDiscount: false,
    isPromo: true,
    discountPrice: null,
  },
  {
    name: 'Ron Santa Teresa 1796',
    description: '750 ml',
    price: 38,
    isOnDiscount: true,
    isPromo: true,
    discountPrice: 32.3,
  },
  {
    name: 'Pepito Original',
    description: '80 g',
    price: 1.1,
    isOnDiscount: false,
    isPromo: true,
    discountPrice: null,
  },
];

function toMockProducts(warehouseId: string, prefix: string, rows: MockProduct[]): Product[] {
  return rows.map((row, index) => ({
    ...row,
    id: `${warehouseId}-${prefix}-${index + 1}`,
    categoryId: 'mock-category-1',
    subcategoryId: null,
    imageUrls: [],
    barcode: null,
    sku: null,
    isActive: true,
    createdBy: null,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  }));
}

export const productService = {
  /** Productos en promoción (`warehouse_products.is_promo = true`) de la tienda. */
  async getPromotions(warehouseId: string): Promise<Product[]> {
    return toMockProducts(warehouseId, 'promo', MOCK_PROMOS);
  },
};
