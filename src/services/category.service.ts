import { supabase } from '@/lib/supabase';
import type { Category, Subcategory } from '@/models/warehouse.model';
import type { Database } from '@/types/database';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type SubcategoryRow = Database['public']['Tables']['subcategories']['Row'];

function transformCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    isActive: row.is_active ?? true,
    createdBy: row.created_by,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

function transformSubcategory(row: SubcategoryRow): Subcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    imageUrl: row.image_url,
    isActive: row.is_active ?? true,
    createdBy: row.created_by,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export const categoryService = {
  /** Categorías activas, en el orden definido en la web (`order`) y luego por nombre. */
  async getActive(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true, nullsFirst: false })
      .order('name');
    if (error) throw new Error('No pudimos cargar las categorías');
    return data.map(transformCategory);
  },

  /** Una categoría por id, o `null` si no existe (o no está activa). */
  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error('No pudimos cargar la categoría');
    return data ? transformCategory(data) : null;
  },

  /** Una subcategoría por id, o `null` si no existe (o no está activa). */
  async getSubcategoryById(id: string): Promise<Subcategory | null> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error('No pudimos cargar la subcategoría');
    return data ? transformSubcategory(data) : null;
  },

  /** Subcategorías activas de una categoría, ordenadas por nombre. */
  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name');
    if (error) throw new Error('No pudimos cargar las subcategorías');
    return data.map(transformSubcategory);
  },

  /** Subcategorías activas del catálogo (filtros del buscador), ordenadas por nombre. */
  async getSubcategories(): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw new Error('No pudimos cargar las subcategorías');
    return data.map(transformSubcategory);
  },
};
