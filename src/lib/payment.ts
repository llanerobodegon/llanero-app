import { formatBs, formatUSD } from '@/lib/format';
import { getPaymentMethodLabel } from '@/lib/order-status';
import type { BankAccount } from '@/models/bank-account.model';
import type { PaymentMethodType } from '@/models/order.model';

/** Un método de pago que ofrece la tienda, con la cuenta a la que se paga. */
export interface PaymentOption {
  type: PaymentMethodType;
  label: string;
  account: BankAccount;
  /** Se paga en bolívares (métodos nacionales) o en dólares (internacionales). */
  currency: 'BS' | 'USD';
}

/** Orden en que se muestran los métodos. */
const ORDER: PaymentMethodType[] = ['pago_movil', 'transferencia', 'zelle', 'banesco_panama'];

/**
 * Métodos de pago que ofrece una tienda según sus cuentas: una cuenta nacional da
 * transferencia (y Pago Móvil si tiene teléfono); una internacional, su tipo.
 */
export function getPaymentOptions(accounts: BankAccount[]): PaymentOption[] {
  const options = new Map<PaymentMethodType, PaymentOption>();
  const add = (type: PaymentMethodType, account: BankAccount, currency: 'BS' | 'USD') => {
    if (!options.has(type)) {
      options.set(type, { type, label: getPaymentMethodLabel(type), account, currency });
    }
  };
  for (const account of accounts) {
    if (account.scope === 'nacional') {
      if (account.pagoMovilPhone) add('pago_movil', account, 'BS');
      add('transferencia', account, 'BS');
    } else if (account.type) {
      add(account.type, account, 'USD');
    }
  }
  return ORDER.flatMap((type) => (options.has(type) ? [options.get(type)!] : []));
}

/** Un dato para hacer el pago, con el valor que se copia (sin formato extra). */
export interface PaymentDetail {
  key: string;
  label: string;
  value: string;
  /** El monto se destaca en la tarjeta. */
  isAmount?: boolean;
}

/** Datos que el cliente necesita para pagar con la opción elegida. */
export function getPaymentDetails(
  option: PaymentOption,
  totalUsd: number,
  exchangeRate: number,
): PaymentDetail[] {
  const { account } = option;
  const amount: PaymentDetail = {
    key: 'amount',
    label: 'Monto',
    value: option.currency === 'BS' ? formatBs(totalUsd * exchangeRate) : formatUSD(totalUsd),
    isAmount: true,
  };
  const rows: (PaymentDetail | null)[] =
    option.type === 'pago_movil'
      ? [
          account.bank ? { key: 'bank', label: 'Banco', value: account.bank } : null,
          { key: 'phone', label: 'Teléfono', value: account.pagoMovilPhone ?? '' },
          account.rif ? { key: 'rif', label: 'RIF', value: account.rif } : null,
          amount,
        ]
      : option.type === 'transferencia'
        ? [
            account.bank ? { key: 'bank', label: 'Banco', value: account.bank } : null,
            { key: 'account', label: 'Cuenta', value: account.accountNumber },
            { key: 'holder', label: 'Titular', value: account.holderName },
            account.rif ? { key: 'rif', label: 'RIF', value: account.rif } : null,
            amount,
          ]
        : option.type === 'zelle'
          ? [
              { key: 'email', label: 'Correo', value: account.accountNumber },
              { key: 'holder', label: 'Titular', value: account.holderName },
              amount,
            ]
          : [
              { key: 'account', label: 'Cuenta', value: account.accountNumber },
              { key: 'holder', label: 'Titular', value: account.holderName },
              amount,
            ];
  return rows.filter((row): row is PaymentDetail => row !== null);
}

/** Todos los datos en texto, para "Copiar todo". */
export function paymentDetailsToText(option: PaymentOption, details: PaymentDetail[]): string {
  return [option.label, ...details.map((detail) => `${detail.label}: ${detail.value}`)].join('\n');
}
