/** Tarjeta de una ubicación (pin, nombre y dirección), cargada como imagen desde la web. */
export interface LocationImage {
  id: string;
  /** Nombre del archivo, para ordenar y como texto de respaldo. */
  name: string;
  imageUrl: string;
}
