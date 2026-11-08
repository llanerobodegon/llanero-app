# components/ — Componentes reutilizables

Piezas de UI que se usan en más de una pantalla: `product-card.tsx`, `price-tag.tsx`, `empty-state.tsx`.
Agrupa por dominio cuando crezcan (`components/product/`, `components/order/`).

**Reglas:**
- Reciben todo por props; nunca consultan datos ni importan `services/` o ViewModels.
- Usa HeroUI Native y los colores del tema (`bg-accent`, `text-foreground`), no colores sueltos.
- Si un componente solo lo usa una pantalla, puede quedarse dentro de su View hasta que se repita.
