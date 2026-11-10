import { supabase } from '@/lib/supabase';
import { normalizeCase } from '@/lib/text';
import type { Product } from '@/models/warehouse.model';
import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];

/**
 * Productos del catálogo.
 * - El precio, el descuento y la promo son del producto (`products`), iguales en todas las
 *   tiendas (la migración 011 de llanero-web quitó los precios por tienda).
 * - `warehouse_products` solo dice qué productos tiene cada tienda (`is_available`): todas las
 *   consultas se filtran por la tienda elegida con ese join.
 */

/** Columnas del producto + el join que lo limita a la tienda (inner = solo si está en ella). */
const PRODUCT_IN_WAREHOUSE = '*, warehouse_products!inner(warehouse_id, is_available)';

/** Tamaño de las secciones del Inicio. */
const SECTION_LIMIT = 12;
/** Máximo de resultados de búsqueda y de una subcategoría (sin paginación por ahora). */
const LIST_LIMIT = 100;

/** Categoría que alimenta la sección "Mercado" del Inicio. */
const MARKET_CATEGORY_NAME = 'Mercado';
/** Categoría de la sección "Populares" mientras no haya un ranking de más vendidos. */
const POPULAR_CATEGORY_NAME = 'Licores';

function transformProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id ?? '',
    subcategoryId: row.subcategory_id,
    // Muchos nombres vienen en MAYÚSCULAS desde el admin.
    name: normalizeCase(row.name),
    // La presentación ("0.75L", "500G") se deja como está: el formato título rompería las unidades.
    description: row.description?.trim() || null,
    imageUrls: (row.image_urls ?? []).filter(Boolean),
    barcode: row.barcode,
    sku: row.sku,
    price: Number(row.price) || 0,
    isActive: row.is_active ?? true,
    isOnDiscount: row.is_on_discount ?? false,
    isPromo: row.is_promo ?? false,
    discountPrice: row.discount_price === null ? null : Number(row.discount_price),
    createdBy: row.created_by,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

/** Productos activos y disponibles en la tienda (base de todas las consultas). */
function inWarehouse(warehouseId: string) {
  return supabase
    .from('products')
    .select(PRODUCT_IN_WAREHOUSE)
    .eq('warehouse_products.warehouse_id', warehouseId)
    .eq('warehouse_products.is_available', true)
    .eq('is_active', true);
}

/** Id de una categoría por nombre (sin distinguir mayúsculas), o `null` si no existe. */
async function categoryIdByName(name: string): Promise<string | null> {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', name)
    .eq('is_active', true)
    .maybeSingle();
  return data?.id ?? null;
}

/** Escapa los comodines de `ilike` en lo que escribe el cliente. */
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (char) => `\\${char}`);

export const productService = {
  /** Productos en promoción o con descuento de la tienda. */
  async getPromotions(warehouseId: string): Promise<Product[]> {
    const { data, error } = await inWarehouse(warehouseId)
      .or('is_promo.eq.true,is_on_discount.eq.true')
      .order('updated_at', { ascending: false })
      .limit(SECTION_LIMIT);
    if (error) throw new Error('No pudimos cargar las promociones');
    return data.map(transformProduct);
  },

  /**
   * "Populares": por ahora, los Licores agregados más recientemente en la tienda.
   * TODO: los más vendidos necesitan una vista o función en la base (las reglas de acceso no
   * dejan al cliente leer los pedidos de otros); crearla en las migraciones de llanero-web.
   */
  async getPopular(warehouseId: string): Promise<Product[]> {
    const categoryId = await categoryIdByName(POPULAR_CATEGORY_NAME);
    if (!categoryId) return [];
    const { data, error } = await inWarehouse(warehouseId)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .limit(SECTION_LIMIT);
    if (error) throw new Error('No pudimos cargar los productos populares');
    return data.map(transformProduct);
  },

  /** Productos de la categoría "Mercado" de la tienda. */
  async getMarket(warehouseId: string): Promise<Product[]> {
    const categoryId = await categoryIdByName(MARKET_CATEGORY_NAME);
    if (!categoryId) return [];
    const { data, error } = await inWarehouse(warehouseId)
      .eq('category_id', categoryId)
      .order('name')
      .limit(SECTION_LIMIT);
    if (error) throw new Error('No pudimos cargar los productos de mercado');
    return data.map(transformProduct);
  },

  /**
   * Productos de la tienda que coinciden con el texto (en el nombre) y la subcategoría.
   * Sin texto ni subcategoría devuelve el catálogo de la tienda (hasta `LIST_LIMIT`).
   * Nota: la búsqueda distingue acentos ("cafe" no encuentra "Café") hasta tener una función
   * con `unaccent` en la base.
   */
  async search(
    warehouseId: string,
    { query, subcategoryId }: { query: string; subcategoryId: string | null },
  ): Promise<Product[]> {
    let request = inWarehouse(warehouseId);
    const text = query.trim();
    if (text) request = request.ilike('name', `%${escapeLike(text)}%`);
    if (subcategoryId) request = request.eq('subcategory_id', subcategoryId);
    const { data, error } = await request.order('name').limit(LIST_LIMIT);
    if (error) throw new Error('No pudimos buscar productos');
    return data.map(transformProduct);
  },

  /** Un producto de la tienda por id, o `null` si no existe o la tienda no lo tiene. */
  async getById(warehouseId: string, productId: string): Promise<Product | null> {
    const { data, error } = await inWarehouse(warehouseId).eq('id', productId).maybeSingle();
    if (error) throw new Error('No pudimos cargar el producto');
    return data ? transformProduct(data) : null;
  },
};
