# contexts/ — Estado compartido

Estado que necesitan varias pantallas a la vez: sesión (`auth-context.tsx`), bodega seleccionada
(`warehouse-context.tsx`) y carrito (`cart-context.tsx`).

**Reglas:**
- Cada contexto exporta su `XProvider` y un hook `useXContext()` que lanza error si se usa fuera del provider.
- Para cargar datos usa `services/`, igual que un ViewModel.
- Los providers se montan en `src/app/_layout.tsx`.
- Si el estado lo usa una sola pantalla, va en su ViewModel, no aquí.
