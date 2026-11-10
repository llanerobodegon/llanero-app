import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import { favoriteService } from '@/services/favorite.service';

interface FavoritesContextType {
  /** Ids de productos favoritos (el más reciente primero). */
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  /** Agrega o quita un producto de favoritos. */
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Favoritos del usuario con sesión (tabla `favorites` en Supabase), compartidos por el
 * detalle de producto y la pestaña Favoritos.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuthContext();
  // Lista guardada junto a su usuario: al cambiar de cuenta, la anterior deja de valer.
  const [state, setState] = useState<{ userId: string | null; ids: string[] }>({
    userId: null,
    ids: [],
  });
  const favoriteIds = useMemo(
    () => (state.userId === userId ? state.ids : []),
    [state.ids, state.userId, userId],
  );

  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    // Primero sube los que hubiera guardados en el teléfono (versión anterior) y luego carga.
    favoriteService
      .migrateLocal(userId)
      .catch(() => {})
      .then(() => favoriteService.getIds(userId))
      .then((ids) => isActive && setState({ userId, ids }))
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, [userId]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  /** Cambia al instante y guarda en la base; si falla, revierte el cambio. */
  const toggleFavorite = useCallback(
    (productId: string) => {
      if (!userId) return;
      const wasFavorite = favoriteIds.includes(productId);
      const apply = (add: boolean) =>
        setState((current) => {
          const ids = current.userId === userId ? current.ids : [];
          const without = ids.filter((id) => id !== productId);
          return { userId, ids: add ? [productId, ...without] : without };
        });

      apply(!wasFavorite);
      const request = wasFavorite
        ? favoriteService.remove(userId, productId)
        : favoriteService.add(userId, productId);
      request.catch(() => apply(wasFavorite));
    },
    [favoriteIds, userId],
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavoritesContext debe usarse dentro de FavoritesProvider');
  return context;
}
