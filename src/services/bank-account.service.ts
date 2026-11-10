import type { BankAccount } from '@/models/bank-account.model';

// TODO: reemplazar el mock por Supabase:
//   supabase.from('bank_accounts').select('*').eq('warehouse_id', warehouseId).eq('is_active', true)
// La política RLS ya deja leerlas a cualquier usuario autenticado (para el checkout).
// La firma no debe cambiar.

export const bankAccountService = {
  /** Cuentas activas de una tienda para recibir pagos. */
  async getByWarehouse(warehouseId: string): Promise<BankAccount[]> {
    return [
      {
        id: `${warehouseId}-banesco`,
        warehouseId,
        holderName: 'Llanero Bodegón C.A.',
        rif: 'J-50123456-7',
        bank: 'Banesco',
        accountNumber: '0134-0123-45-1234567890',
        pagoMovilPhone: '0414-1234567',
        scope: 'nacional',
        type: null,
      },
      {
        id: `${warehouseId}-zelle`,
        warehouseId,
        holderName: 'Llanero Bodegón LLC',
        rif: null,
        bank: null,
        accountNumber: 'pagos@llanerobodegon.com',
        pagoMovilPhone: null,
        scope: 'internacional',
        type: 'zelle',
      },
      {
        id: `${warehouseId}-banesco-panama`,
        warehouseId,
        holderName: 'Llanero Bodegón Corp.',
        rif: null,
        bank: 'Banesco Panamá',
        accountNumber: '201800123456',
        pagoMovilPhone: null,
        scope: 'internacional',
        type: 'banesco_panama',
      },
    ];
  },
};
