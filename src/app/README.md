# app/ — Rutas (Expo Router)

Cada archivo es una ruta; `_layout.tsx` define navegadores y providers.

**Regla:** una ruta no tiene lógica ni UI propia. Solo importa su View y la exporta por defecto.

```tsx
// src/app/cart.tsx
import { CartView } from '@/views/CartView';

export default CartView;
```

Si la ruta tiene parámetros, léelos aquí con `useLocalSearchParams` y pásalos como props a la View.
Nada que no sea una ruta vive en esta carpeta.
