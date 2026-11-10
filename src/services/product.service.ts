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

const MOCK_POPULAR: MockProduct[] = [
  {
    name: 'Cerveza Polar Pilsen',
    description: 'Caja 36 x 222 ml',
    price: 22,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Coca-Cola',
    description: '2 L',
    price: 2.4,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Hielo',
    description: 'Bolsa 3 kg',
    price: 1.5,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Doritos Mega Queso',
    description: '150 g',
    price: 2.9,
    isOnDiscount: true,
    isPromo: false,
    discountPrice: 2.47,
  },
  {
    name: 'Whisky Buchanan’s 12',
    description: '750 ml',
    price: 45,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
];

const MOCK_MARKET: MockProduct[] = [
  {
    name: 'Arroz Mary Tradicional',
    description: '1 kg',
    price: 1.45,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Aceite Diana',
    description: '1 L',
    price: 3.2,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Pasta Capri Larga',
    description: '1 kg',
    price: 1.9,
    isOnDiscount: true,
    isPromo: false,
    discountPrice: 1.71,
  },
  {
    name: 'Azúcar Montalbán',
    description: '1 kg',
    price: 1.35,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Huevos',
    description: 'Cartón 30 und.',
    price: 5.5,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
  {
    name: 'Leche Completa Campestre',
    description: '1 L',
    price: 1.95,
    isOnDiscount: false,
    isPromo: false,
    discountPrice: null,
  },
];

/** Minúsculas y sin acentos, para buscar "cafe" y encontrar "Café". */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function toMockProducts(warehouseId: string, prefix: string, rows: MockProduct[]): Product[] {
  return rows.map((row, index) => ({
    ...row,
    id: `${warehouseId}-${prefix}-${index + 1}`,
    categoryId: 'mock-category-1',
    // Los productos de prueba no tienen subcategoría; llegan reales en el paso de productos.
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

  /**
   * Productos más vendidos de la tienda.
   * TODO: definir con Supabase de dónde sale (p. ej. conteo en `order_items` de la tienda).
   */
  async getPopular(warehouseId: string): Promise<Product[]> {
    return toMockProducts(warehouseId, 'popular', MOCK_POPULAR);
  },

  /**
   * Productos de mercado (víveres básicos) de la tienda.
   * TODO: definir con Supabase qué los identifica (p. ej. una categoría "Mercado").
   */
  async getMarket(warehouseId: string): Promise<Product[]> {
    return toMockProducts(warehouseId, 'market', MOCK_MARKET);
  },

  /**
   * Un producto de la tienda por id, o `null` si no existe ahí.
   * TODO: en Supabase, `warehouse_products` (warehouse_id, product_id) con join a `products`.
   */
  /** Productos de la tienda que coinciden con el texto y la subcategoría (vacíos = todos). */
  async search(
    warehouseId: string,
    { query, subcategoryId }: { query: string; subcategoryId: string | null },
  ): Promise<Product[]> {
    // TODO: en Supabase, `warehouse_products` de la tienda con join a `products`, filtrando
    // por `products.name ilike %query%` y `products.subcategory_id`.
    const q = normalize(query);
    return [
      ...toMockProducts(warehouseId, 'promo', MOCK_PROMOS),
      ...toMockProducts(warehouseId, 'popular', MOCK_POPULAR),
      ...toMockProducts(warehouseId, 'market', MOCK_MARKET),
    ].filter(
      (product) =>
        (!subcategoryId || product.subcategoryId === subcategoryId) &&
        (!q || normalize(`${product.name} ${product.description ?? ''}`).includes(q)),
    );
  },

  async getById(warehouseId: string, productId: string): Promise<Product | null> {
    const all = [
      ...toMockProducts(warehouseId, 'promo', MOCK_PROMOS),
      ...toMockProducts(warehouseId, 'popular', MOCK_POPULAR),
      ...toMockProducts(warehouseId, 'market', MOCK_MARKET),
    ];
    return all.find((product) => product.id === productId) ?? null;
  },
};
