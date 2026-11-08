# models/ — Modelos

Interfaces de TypeScript del dominio, en camelCase: `product.model.ts`, `warehouse.model.ts`,
`order.model.ts`, `user.model.ts`, `address.model.ts`, `cart.model.ts`.

**Reglas:**
- Solo tipos: sin lógica, sin imports de Supabase ni de React.
- Usa los mismos nombres y campos que la web app (`llanero-web/src/models`) para que ambos
  proyectos hablen igual. Ej.: `Warehouse.logoUrl`, `Product.isOnDiscount`.
- Los datos para crear o editar van como DTOs en el mismo archivo: `CreateOrderData`, `UpdateAddressData`.
- La base de datos usa snake_case (`logo_url`); la conversión se hace en `services/`, nunca aquí.
