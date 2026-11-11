/** Un requisito o recomendación para la contraseña nueva. */
export interface PasswordCheck {
  key: 'length' | 'uppercase' | 'number' | 'symbol';
  label: string;
  met: boolean;
  /** `false` = solo recomendado (no impide guardar). */
  isRequired: boolean;
}

export const MIN_PASSWORD_LENGTH = 8;

/** Requisitos (obligatorios) y recomendaciones de la contraseña nueva. */
export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    {
      key: 'length',
      label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      met: password.length >= MIN_PASSWORD_LENGTH,
      isRequired: true,
    },
    {
      key: 'uppercase',
      label: 'Una letra mayúscula',
      met: /[A-ZÁÉÍÓÚÑ]/.test(password),
      isRequired: true,
    },
    { key: 'number', label: 'Un número', met: /\d/.test(password), isRequired: true },
    {
      key: 'symbol',
      label: 'Un símbolo (recomendado)',
      met: /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(password),
      isRequired: false,
    },
  ];
}

/** Cumple todos los requisitos obligatorios. */
export function isPasswordValid(password: string): boolean {
  return getPasswordChecks(password).every((check) => !check.isRequired || check.met);
}

export type PasswordStrength = {
  /** 0 (vacía) a 4 (fuerte). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

/** Nivel de la contraseña según cuántos requisitos cumple, con un extra por ser larga. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '' };
  const met = getPasswordChecks(password).filter((check) => check.met).length;
  const bonus = password.length >= 12 ? 1 : 0;
  const score = Math.max(1, Math.min(4, met + bonus - 1)) as 1 | 2 | 3 | 4;
  const labels = { 1: 'Débil', 2: 'Regular', 3: 'Buena', 4: 'Fuerte' } as const;
  return { score, label: labels[score] };
}
