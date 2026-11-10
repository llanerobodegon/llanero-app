import type { Category, Subcategory } from '@/models/warehouse.model';

// TODO: reemplazar por la consulta a Supabase (`categories` con is_active = true, ordenadas
// por name) cuando se conecte el cliente. La firma de los métodos no debe cambiar.
const MOCK_DATE = '2026-11-01T00:00:00.000Z';
const MOCK_CATEGORIES: Category[] = [
  'Víveres',
  'Bebidas',
  'Charcutería',
  'Lácteos',
  'Licores',
  'Limpieza',
  'Snacks',
].map((name, index) => ({
  id: `mock-category-${index + 1}`,
  name,
  imageUrl: null,
  isActive: true,
  createdBy: null,
  createdAt: MOCK_DATE,
  updatedAt: MOCK_DATE,
}));

/** Subcategorías de prueba: [nombre, categoría]. */
const MOCK_SUBCATEGORY_ROWS: [string, string][] = [
  ['Cervezas', 'Bebidas'],
  ['Refrescos', 'Bebidas'],
  ['Hielo', 'Bebidas'],
  ['Rones', 'Licores'],
  ['Whiskys', 'Licores'],
  ['Harinas y granos', 'Víveres'],
  ['Aceites y azúcar', 'Víveres'],
  ['Café', 'Víveres'],
  ['Quesos', 'Lácteos'],
  ['Leche y huevos', 'Lácteos'],
  ['Papitas y galletas', 'Snacks'],
];

export const MOCK_SUBCATEGORIES: Subcategory[] = MOCK_SUBCATEGORY_ROWS.map(
  ([name, categoryName], index) => ({
    id: `mock-subcategory-${index + 1}`,
    categoryId: MOCK_CATEGORIES.find((c) => c.name === categoryName)?.id ?? '',
    name,
    imageUrl: null,
    isActive: true,
    createdBy: null,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  }),
);

export const categoryService = {
  /** Categorías activas del catálogo, ordenadas por nombre. */
  async getActive(): Promise<Category[]> {
    return MOCK_CATEGORIES.filter((c) => c.isActive).sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Una categoría por id, o `null` si no existe.
   * TODO: en Supabase, `categories` con `.eq('id', id).maybeSingle()`.
   */
  async getById(id: string): Promise<Category | null> {
    return MOCK_CATEGORIES.find((c) => c.id === id) ?? null;
  },

  /**
   * Una subcategoría por id, o `null` si no existe.
   * TODO: en Supabase, `subcategories` con `.eq('id', id).maybeSingle()`.
   */
  async getSubcategoryById(id: string): Promise<Subcategory | null> {
    return MOCK_SUBCATEGORIES.find((s) => s.id === id) ?? null;
  },

  /**
   * Subcategorías activas de una categoría, ordenadas por nombre.
   * TODO: en Supabase, `subcategories` con category_id = id e is_active = true.
   */
  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    return MOCK_SUBCATEGORIES.filter((s) => s.isActive && s.categoryId === categoryId).sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  },

  /**
   * Subcategorías activas del catálogo (para los filtros del buscador), ordenadas por nombre.
   * TODO: en Supabase, `subcategories` con is_active = true, ordenadas por name.
   */
  async getSubcategories(): Promise<Subcategory[]> {
    return MOCK_SUBCATEGORIES.filter((s) => s.isActive).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  },
};
