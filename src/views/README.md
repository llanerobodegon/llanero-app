# views/ — Pantallas (View)

Una pantalla completa por archivo: `HomeView.tsx`, `CartView.tsx`, `OrderDetailView.tsx`.

**Reglas:**
- Obtiene todo de su ViewModel: `const vm = useCartViewModel();`
- Solo pinta y llama acciones del ViewModel (`vm.addItem`, `vm.refetch`).
- Nunca importa `services/` ni `lib/supabase`.
- Muestra los estados `isLoading`, `error` y vacío que expone el ViewModel.
- Arma la UI con `components/` y HeroUI Native.

Exporta con nombre: `export function CartView() {}`.
