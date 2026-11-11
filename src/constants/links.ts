/** Páginas legales en la web de Llanero (se abren en el navegador dentro de la app). */
export const LegalLinks = {
  terms: 'https://www.llanerobodegon.com/condiciones',
  privacy: 'https://www.llanerobodegon.com/privacidad',
} as const;

/**
 * Banner "Métodos de pago" del Inicio (1536 × 404, fondo transparente), en el bucket público
 * `admin-app` del proyecto actual. Si se reemplaza el archivo con el mismo nombre, la app lo
 * muestra sin cambios (puede tardar por la caché de imágenes).
 */
export const PaymentMethodsBannerImage = {
  uri: 'https://uejjlbxgtlpqukuhusmt.supabase.co/storage/v1/object/public/admin-app/banner-payments.png',
  aspectRatio: 1536 / 404,
} as const;
