import { supabase } from '@/lib/supabase';
import type { BankAccount, BankAccountScope, BankAccountType } from '@/models/bank-account.model';
import type { Database } from '@/types/database';

type BankAccountRow = Database['public']['Tables']['bank_accounts']['Row'];

function transformBankAccount(row: BankAccountRow): BankAccount {
  return {
    id: row.id,
    warehouseId: row.warehouse_id,
    holderName: row.holder_name,
    rif: row.rif,
    bank: row.bank,
    accountNumber: row.account_number,
    pagoMovilPhone: row.pago_movil_phone,
    scope: row.scope as BankAccountScope,
    type: row.type as BankAccountType | null,
  };
}

export const bankAccountService = {
  /** Cuentas activas de una tienda para recibir pagos (RLS: cualquier usuario con sesión). */
  async getByWarehouse(warehouseId: string): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .eq('is_active', true)
      .order('created_at');
    if (error) throw new Error('No pudimos cargar los métodos de pago de la tienda');
    return data.map(transformBankAccount);
  },
};
