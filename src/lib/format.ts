/** Precio en dólares con dos decimales: 16 → "$16.00". */
export function formatUSD(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Porcentaje de descuento redondeado: (20, 16) → 20. */
export function discountPercent(price: number, discountPrice: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

/** Precio final: el de descuento si el producto está en descuento, si no el normal. */
export function finalPrice(
  price: number,
  isOnDiscount: boolean,
  discountPrice: number | null,
): number {
  return isOnDiscount && discountPrice !== null ? discountPrice : price;
}

/** "3:45 p. m." */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit' });
}

/** Mismo día del calendario local. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Fecha corta y relativa para listas: "Hoy, 3:45 p. m.", "Ayer, 9:10 a. m.", "8 nov"
 * o "8 nov 2025" si es de otro año.
 */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return `Hoy, ${formatTime(date)}`;
  if (isSameDay(date, yesterday)) return `Ayer, ${formatTime(date)}`;
  return date
    .toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    })
    .replace('.', '');
}

/** Monto en bolívares con formato venezolano: 8285.3 → "Bs. 8.285,30". */
export function formatBs(value: number): string {
  return `Bs. ${value.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Fecha y hora completas: "9 nov 2026, 3:45 p. m.". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = date
    .toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '');
  return `${day}, ${formatTime(date)}`;
}

/** Solo la hora: "3:45 p. m.". */
export function formatTimeOfDay(iso: string): string {
  return formatTime(new Date(iso));
}

/**
 * Correo parcialmente oculto: "mariagonzalez@gmail.com" → "mari***@gmail.com".
 * Usuarios cortos muestran solo la primera letra: "ana@gmail.com" → "a***@gmail.com".
 */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const visible = local.length > 4 ? local.slice(0, 4) : local.slice(0, 1);
  return `${visible}***${email.slice(at)}`;
}

/** Iniciales para un avatar: ("María", "González") → "MG". */
export function initials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}
