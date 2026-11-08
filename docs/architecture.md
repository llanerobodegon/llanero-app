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
