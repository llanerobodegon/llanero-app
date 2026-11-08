# services/ — Acceso a datos

Un objeto por recurso: `warehouseService`, `productService`, `orderService`, `authService`.
Archivo: `warehouse.service.ts`.

**Reglas:**
- Es la **única** capa que importa el cliente de Supabase (`@/lib/supabase`).
- Convierte cada fila de la base (snake_case) al modelo (camelCase) con una función `transformX`.
- Devuelve modelos, nunca filas crudas.
- Ante un error de Supabase lanza `new Error(error.message)`; el ViewModel decide qué mostrar.
- Sin estado y sin React: funciones `async` puras.

```ts
function transformWarehouse(row: Record<string, unknown>): Warehouse {
  return {
    id: row.id as string,
    name: row.name as string,
    logoUrl: row.logo_url as string | null,
    deliveryFee: Number(row.delivery_fee) || 0,
    isOpen: (row.is_open as boolean) ?? true,
    // ...
  };
}

export const warehouseService = {
  async getOpen(): Promise<Warehouse[]> {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true);
    if (error) throw new Error(error.message);
    return (data ?? []).map(transformWarehouse);
  },
};
```

Recuerda: el catálogo siempre se consulta filtrado por la bodega seleccionada
(`warehouse_products.warehouse_id`), o un producto aparece repetido por cada bodega.
