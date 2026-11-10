// TODO: definir con la web de dónde sale la tasa del día (p. ej. una clave en `store_settings`
// o un servicio del BCV) y reemplazar el mock. La firma no debe cambiar.

export const exchangeRateService = {
  /** Bolívares por dólar para convertir el total del pedido. */
  async getCurrent(): Promise<number> {
    return 230.5;
  },
};
