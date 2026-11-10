import { supabase } from '@/lib/supabase';

/**
 * Comprobantes de pago: se suben al bucket privado `payment-receipts`, en la carpeta del
 * usuario (`<id del usuario>/`), la única donde las reglas del Storage lo dejan subir. Solo el
 * cliente y admin/gerentes pueden verlos (el panel web abre un enlace firmado temporal).
 * En `orders.payment_proof_url` se guarda `payment-receipts/<uid>/<archivo>` (bucket + ruta).
 */
const BUCKET = 'payment-receipts';

/** Extensión según el tipo de imagen (las fotos del teléfono suelen venir como JPEG o HEIC). */
function extensionFor(mimeType: string): string {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('heic')) return 'heic';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

export const paymentProofService = {
  /** Sube la imagen local (uri del selector) y devuelve su referencia (`bucket/ruta`). */
  async upload(localUri: string, mimeType = 'image/jpeg'): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');

    let body: ArrayBuffer;
    try {
      body = await (await fetch(localUri)).arrayBuffer();
    } catch {
      throw new Error('No pudimos leer la imagen del comprobante');
    }

    const random = Math.random().toString(36).slice(2, 10);
    const path = `${userId}/${Date.now()}-${random}.${extensionFor(mimeType)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, body, { contentType: mimeType, upsert: false });
    if (error) throw new Error('No pudimos subir el comprobante. Inténtalo de nuevo');

    return `${BUCKET}/${path}`;
  },
};
