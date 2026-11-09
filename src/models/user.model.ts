// Mismos nombres que llanero-web/src/models/user.model.ts

export type RoleName = 'customer' | 'admin' | 'manager' | 'delivery';

/** Códigos de operadora en Venezuela (`users.phone_code`). */
export type PhoneCode = '0412' | '0414' | '0416' | '0422' | '0424' | '0426';

/** Tipo de documento: venezolano o extranjero. */
export type IdType = 'V' | 'E';

export interface User {
  id: string;
  roleId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: PhoneCode | null;
  phone: string | null;
  idType: IdType | null;
  idNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
