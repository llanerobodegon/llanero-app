# viewmodels/ — ViewModels

Un hook por pantalla: `useHomeViewModel.ts`, `useCartViewModel.ts`.

**Reglas:**
- Llama a `services/` y a `contexts/`; nunca a Supabase directamente.
- Guarda el estado de la pantalla y expone siempre `isLoading` y `error` (mensaje en español).
- Expone acciones como funciones (`refetch`, `addItem`, `submitOrder`) envueltas en `useCallback`.
- No devuelve JSX ni importa componentes.

```ts
export function useCategoriesViewModel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCategories(await categoryService.getActive());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}
```
