/**
 * Preposiciones y conjunciones que van en minúscula (salvo al inicio). Los artículos (la, las,
 * los, el) se capitalizan porque suelen ser parte de nombres de lugares: "Las Mercedes".
 */
const LOWERCASE_WORDS = new Set([
  'a',
  'al',
  'con',
  'de',
  'del',
  'e',
  'en',
  'o',
  'para',
  'por',
  'u',
  'y',
]);

/** Letra inicial en mayúscula y el resto en minúscula, respetando acentos y ñ. */
const capitalize = (word: string) =>
  word.charAt(0).toLocaleUpperCase('es') + word.slice(1).toLocaleLowerCase('es');

/** Una palabra en formato título; las abreviaturas con punto ("C.C.", "AV.") por partes. */
function titleWord(word: string, isFirst: boolean): string {
  const lower = word.toLocaleLowerCase('es');
  if (!isFirst && LOWERCASE_WORDS.has(lower)) return lower;
  // Capitaliza cada tramo de letras: "c.c." → "C.C.", "san-juan" → "San-Juan", "(norte)" → "(Norte)".
  return lower.replace(/\p{L}+/gu, (segment, offset: number) => {
    // En abreviaturas tipo "c.c." cada letra suelta va en mayúscula.
    const prev = lower[offset - 1];
    return offset === 0 || prev === '.' || prev === '-' || prev === '(' || prev === '/'
      ? capitalize(segment)
      : segment;
  });
}

/**
 * Normaliza textos que el admin cargó TODO EN MAYÚSCULAS (o todo en minúsculas) a formato
 * título: "BODEGÓN LAS MERCEDES" → "Bodegón Las Mercedes", "AV. LARA CON CALLE 5" →
 * "Av. Lara con Calle 5". Si el texto ya mezcla mayúsculas y minúsculas, se deja tal cual
 * para respetar lo que escribió el admin.
 */
export function normalizeCase(text: string): string;
export function normalizeCase(text: string | null): string | null;
export function normalizeCase(text: string | null): string | null {
  if (!text) return text;
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const hasLetters = /\p{L}/u.test(trimmed);
  const isAllUpper = trimmed === trimmed.toLocaleUpperCase('es');
  const isAllLower = trimmed === trimmed.toLocaleLowerCase('es');
  if (!hasLetters || !(isAllUpper || isAllLower)) return trimmed;
  return trimmed
    .split(' ')
    .map((word, index) => titleWord(word, index === 0))
    .join(' ');
}
