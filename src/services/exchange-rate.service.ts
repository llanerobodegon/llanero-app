/**
 * Tasa del día (bolívares por dólar) desde DolarApi: https://ve.dolarapi.com
 * Se usa la tasa OFICIAL (BCV), campo `promedio`. Se guarda en memoria un rato para no
 * consultarla en cada pantalla.
 */
const DOLAR_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

/** Cuánto se reutiliza la tasa ya consultada. */
const CACHE_MS = 15 * 60 * 1000;

type DolarApiResponse = {
  promedio: number | null;
  fechaActualizacion: string;
};

let cached: { rate: number; fetchedAt: number } | null = null;

export const exchangeRateService = {
  /** Bolívares por dólar (tasa oficial BCV) para convertir el total del pedido. */
  async getCurrent(): Promise<number> {
    if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return cached.rate;

    let data: DolarApiResponse;
    try {
      const response = await fetch(DOLAR_API_URL);
      if (!response.ok) throw new Error(String(response.status));
      data = (await response.json()) as DolarApiResponse;
    } catch {
      // Sin conexión o la API caída: si hay una tasa anterior se usa; si no, se avisa.
      if (cached) return cached.rate;
      throw new Error(
        'No pudimos obtener la tasa del día. Revisa tu conexión e inténtalo de nuevo',
      );
    }

    const rate = Number(data.promedio);
    if (!Number.isFinite(rate) || rate <= 0) {
      if (cached) return cached.rate;
      throw new Error('La tasa del día no está disponible en este momento');
    }

    cached = { rate, fetchedAt: Date.now() };
    return rate;
  },
};
