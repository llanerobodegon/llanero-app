/**
 * Enlace para llamar a un teléfono venezolano guardado como código de operadora + 7 dígitos
 * ("0424" + "1234567" → "tel:04241234567"). `null` si falta alguna de las dos partes.
 */
export function telUrl(phoneCode: string | null, phone: string | null): string | null {
  const digits = `${phoneCode ?? ''}${phone ?? ''}`.replace(/\D/g, '');
  if (!phoneCode || !phone || digits.length < 10) return null;
  return `tel:${digits}`;
}

/** Enlace para llamar a un teléfono en texto libre ("0424-1234567"). `null` si no es válido. */
export function telUrlFromText(raw: string | null): string | null {
  const digits = (raw ?? '').replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 7 ? `tel:${digits}` : null;
}

/** Búsqueda de una dirección escrita en la app de mapas (las direcciones no tienen coordenadas). */
export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
