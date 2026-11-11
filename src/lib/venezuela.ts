import type { IdType, PhoneCode } from '@/models/user.model';

/** Códigos de operadora en el orden en que se muestran en los selectores. */
export const PHONE_CODES: PhoneCode[] = ['0414', '0424', '0412', '0422', '0416', '0426'];

/** Tipos de cédula: venezolano o extranjero. */
export const ID_TYPES: IdType[] = ['V', 'E'];

/** Bancos venezolanos con Pago Móvil, por nombre comercial. */
export const BANKS = [
  'Banco de Venezuela',
  'Banesco',
  'Mercantil',
  'BBVA Provincial',
  'Bancamiga',
  'Banco Nacional de Crédito (BNC)',
  'Bancaribe',
  'Banco del Tesoro',
  'Banco Exterior',
  'Banplus',
  'Banco Plaza',
  'Banco Activo',
  'Banco Bicentenario',
  'Banco Caroní',
  'Banco Fondo Común (BFC)',
  'Venezolano de Crédito',
  'Banco Sofitasa',
  'Bancrecer',
  'Mi Banco',
  '100% Banco',
  'Banco Agrícola de Venezuela',
  'DelSur',
  'R4 Banco Microfinanciero',
] as const;
