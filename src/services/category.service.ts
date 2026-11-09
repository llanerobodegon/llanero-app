import type { Category } from '@/models/warehouse.model';

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

export const categoryService = {
  /** Categorías activas del catálogo, ordenadas por nombre. */
  async getActive(): Promise<Category[]> {
    return MOCK_CATEGORIES.filter((c) => c.isActive).sort((a, b) => a.name.localeCompare(b.name));
  },
};
