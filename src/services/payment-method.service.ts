import { supabase } from '@/lib/supabase';
import type {
  CreatePaymentMethodData,
  SavedPaymentMethod,
  UpdatePaymentMethodData,
} from '@/models/payment-method.model';
import type { PaymentMethodType } from '@/models/order.model';
import type { IdType, PhoneCode } from '@/models/user.model';
import type { Database } from '@/types/database';

type PaymentMethodRow = Database['public']['Tables']['customer_payment_methods']['Row'];

/**
 * Métodos de pago del cliente en `customer_payment_methods` (RLS: cada uno ve y maneja solo
 * los suyos). Un trigger de la base deja un solo predeterminado por cliente.
 */

function transformPaymentMethod(row: PaymentMethodRow): SavedPaymentMethod {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as PaymentMethodType,
    alias: row.alias,
    bank: row.bank ?? '',
    phoneCode: (row.phone_code ?? '0414') as PhoneCode,
    phoneNumber: row.phone_number ?? '',
    documentType: (row.document_type ?? 'V') as IdType,
    documentNumber: row.document_number ?? '',
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Columnas a guardar a partir de los datos del formulario. */
function toColumns(data: CreatePaymentMethodData) {
  return {
    type: data.type,
    alias: data.alias,
    bank: data.bank,
    phone_code: data.phoneCode,
    phone_number: data.phoneNumber,
    document_type: data.documentType,
    document_number: data.documentNumber,
  };
}

/** Id del usuario con sesión (las consultas siempre filtran por él). */
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');
  return id;
}

export const paymentMethodService = {
  /** Métodos del usuario: el predeterminado primero y luego los más recientes. */
  async getMine(): Promise<SavedPaymentMethod[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('customer_payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error('No pudimos cargar tus métodos de pago');
    return data.map(transformPaymentMethod);
  },

  /** Un método del usuario, o `null` si no existe. */
  async getById(id: string): Promise<SavedPaymentMethod | null> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('customer_payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error('No pudimos cargar el método de pago');
    return data ? transformPaymentMethod(data) : null;
  },

  /** Guarda un método. El primero del usuario queda como predeterminado. */
  async create(data: CreatePaymentMethodData): Promise<SavedPaymentMethod> {
    const userId = await currentUserId();
    const { count } = await supabase
      .from('customer_payment_methods')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    const { data: row, error } = await supabase
      .from('customer_payment_methods')
      .insert({ ...toColumns(data), user_id: userId, is_default: !count })
      .select('*')
      .single();
    if (error) throw new Error('No pudimos guardar el método de pago');
    return transformPaymentMethod(row);
  },

  /** Actualiza los datos de un método. */
  async update(id: string, data: UpdatePaymentMethodData): Promise<SavedPaymentMethod> {
    const userId = await currentUserId();
    const { data: row, error } = await supabase
      .from('customer_payment_methods')
      .update(toColumns(data))
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();
    if (error) throw new Error('No pudimos guardar los cambios');
    if (!row) throw new Error('Este método de pago ya no existe');
    return transformPaymentMethod(row);
  },

  /** Elimina un método. Si era el predeterminado, pasa a serlo el más reciente que quede. */
  async remove(id: string): Promise<void> {
    const userId = await currentUserId();
    const { data: removed, error } = await supabase
      .from('customer_payment_methods')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('is_default')
      .maybeSingle();
    if (error) throw new Error('No pudimos eliminar el método de pago');
    if (removed?.is_default) {
      const { data: next } = await supabase
        .from('customer_payment_methods')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (next) await paymentMethodService.setDefault(next.id);
    }
  },

  /** Marca un método como predeterminado; el trigger de la base desmarca los demás. */
  async setDefault(id: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from('customer_payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error('No pudimos cambiar el método predeterminado');
  },
};
