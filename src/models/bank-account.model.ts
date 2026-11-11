// Mismos nombres que `OrderBankAccount` de llanero-web (tabla `bank_accounts`, migraciones 022/023).

export type BankAccountScope = 'nacional' | 'internacional';
export type BankAccountType = 'zelle' | 'banesco_panama';

/**
 * Cuenta de una tienda para recibir pagos. Cada tienda tiene las suyas.
 * - Nacional: banco, número de cuenta y RIF; si tiene `pagoMovilPhone`, también acepta Pago Móvil.
 * - Internacional: `type` dice cuál; `accountNumber` es el correo (Zelle) o la cuenta (Banesco Panamá).
 */
export interface BankAccount {
  id: string;
  warehouseId: string;
  holderName: string;
  rif: string | null;
  bank: string | null;
  accountNumber: string;
  pagoMovilPhone: string | null;
  scope: BankAccountScope;
  type: BankAccountType | null;
}
