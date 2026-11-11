# Arquitectura — Llanero (app móvil)

App de delivery y pickup para clientes de Llanero Bodegón. El panel de administración es la web
app (`llanerobodegon/llanero-web`); las dos comparten el mismo proyecto de Supabase, y el esquema
y las migraciones se gestionan desde la web.

## Patrón: MVVM

El flujo va siempre en una sola dirección:

```
Ruta (src/app) → View → ViewModel → Service → Supabase
                              ↘ Context (estado compartido)
```

| Capa | Carpeta | Responsabilidad | Puede importar |
|---|---|---|---|
| Ruta | `src/app/` | Expo Router: monta la View | `views/` |
| View | `src/views/` | Pinta la pantalla | `viewmodels/`, `components/`, `models/` (tipos) |
| ViewModel | `src/viewmodels/` | Estado, carga, errores y acciones de una pantalla | `services/`, `contexts/`, `models/` |
| Model | `src/models/` | Interfaces del dominio (camelCase) | nada |
| Service | `src/services/` | Consultas a Supabase y conversión fila → modelo | `lib/`, `models/`, `types/` |
| Context | `src/contexts/` | Estado entre pantallas: sesión, bodega, carrito | `services/`, `models/` |
| Componentes | `src/components/` | UI reutilizable, solo props | `models/` (tipos), otros componentes |

Soporte: `hooks/` (hooks genéricos), `lib/` (cliente de Supabase y utilidades puras),
`constants/` (tema), `types/` (tipos genéricos).

## Reglas

1. Solo `services/` importa el cliente de Supabase.
2. Una View nunca importa un service; todo le llega por su ViewModel.
3. Los componentes no consultan datos.
4. Los modelos usan los mismos nombres que `llanero-web/src/models`.
5. La conversión snake_case → camelCase ocurre solo en los services.
6. Todo ViewModel expone `isLoading` y `error`; los mensajes de error van en español.
7. El catálogo siempre se filtra por la bodega seleccionada (`warehouse_products.warehouse_id`).

## Nombres

| Qué | Ejemplo |
|---|---|
| View | `src/views/CartView.tsx` → `export function CartView()` |
| ViewModel | `src/viewmodels/useCartViewModel.ts` → `export function useCartViewModel()` |
| Model | `src/models/order.model.ts` → `Order`, `CreateOrderData` |
| Service | `src/services/order.service.ts` → `export const orderService` |
| Context | `src/contexts/cart-context.tsx` → `CartProvider`, `useCartContext()` |

Cada carpeta tiene un `README.md` con su regla y un ejemplo.

## Ejemplo de una pantalla nueva

1. `src/models/category.model.ts`: interfaz `Category`.
2. `src/services/category.service.ts`: `categoryService.getActive()`.
3. `src/viewmodels/useCategoriesViewModel.ts`: `categories`, `isLoading`, `error`, `refetch`.
4. `src/views/CategoriesView.tsx`: usa el ViewModel y pinta con HeroUI Native.
5. `src/app/categories.tsx`: `export default CategoriesView`.

## Modo repartidor

La misma app sirve a clientes y repartidores. Al iniciar sesión, `AuthProvider` resuelve el rol
de la cuenta (`users.role_id`) y el layout raíz monta la tienda (`(tabs)`) o el modo repartidor
(`(delivery)`: Entregas, Historial y Cuenta, más el detalle en `delivery/[id]`). Un repartidor
nunca llega a las rutas de la tienda, y los datos de la tienda (bodega, carrito, favoritos) no
se cargan para él.

El modo repartidor **no consulta tablas**: `delivery.service.ts` solo llama funciones del
servidor (`get_delivery_orders`, `get_delivery_order`, `delivery_mark_picked_up`,
`delivery_complete_order`, …). Así el código de entrega, los montos y los datos de pago nunca
llegan a su teléfono, y el código se valida en el servidor (máximo 5 intentos). Su tiempo real
no lee la tabla: el servidor envía una señal "algo cambió" a un canal privado del repartidor
(`delivery:<id>`) y la app vuelve a pedir sus entregas. También se actualiza al entrar a la
pantalla, al deslizar y al recibir un aviso.

Diseño completo: `docs/superpowers/specs/2026-11-10-modo-repartidor-design.md`.
