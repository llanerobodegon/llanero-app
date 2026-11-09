/**
 * Teléfono venezolano en formato internacional sin "+", como lo pide wa.me:
 * "0424-1234567", "+58 424 1234567" o "4241234567" → "584241234567". `null` si no es válido.
 */
export function toWhatsAppNumber(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('58')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `58${digits.slice(1)}`;
  if (digits.length === 10) return `58${digits}`;
  return null;
}

/** Enlace de WhatsApp con un mensaje opcional, o `null` si el teléfono no es válido. */
export function whatsAppUrl(phone: string | null, message?: string): string | null {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${text}`;
}
