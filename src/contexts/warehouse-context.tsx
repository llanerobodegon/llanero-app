import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import type { Warehouse } from '@/models/warehouse.model';
import { warehouseService } from '@/services/warehouse.service';

interface WarehouseContextType {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  selectWarehouse: (warehouse: Warehouse) => void;
  isLoading: boolean;
  error: string | null;
  refreshWarehouses: () => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

/**
 * Elige la tienda inicial: la que el cliente usó la última vez si sigue disponible; si no, la
 * primera abierta; si no, la primera.
 */
function pickWarehouse(
  data: Warehouse[],
  currentId: string | null,
  preferredId: string | null,
): Warehouse | null {
  return (
    data.find((w) => w.id === currentId) ??
    data.find((w) => w.id === preferredId) ??
    data.find((w) => w.isOpen) ??
    data[0] ??
    null
  );
}

/**
 * Tienda seleccionada por el cliente. Todo el catálogo se filtra por ella.
 * Las tiendas solo se pueden leer con sesión (RLS), así que se cargan al iniciar sesión y se
 * vacían al cerrarla. La elección se guarda en `users.preferred_warehouse_id`.
 */
export function WarehouseProvider({ children }: { children: ReactNode }) {
  // Solo para quien usa la tienda: con una cuenta de repartidor no se carga nada.
  const { shopUserId: userId } = useAuthContext();

  // Resultado guardado junto al usuario al que pertenece: así, al cambiar de cuenta o cerrar
  // sesión, lo anterior deja de valer sin limpiar el estado a mano.
  const [result, setResult] = useState<{
    userId: string | null;
    warehouses: Warehouse[];
    error: string | null;
  }>({ userId: null, warehouses: [], error: null });
  const [selection, setSelection] = useState<{
    userId: string | null;
    warehouse: Warehouse | null;
  }>({ userId: null, warehouse: null });

  const isCurrent = userId !== null && result.userId === userId;
  const warehouses = isCurrent ? result.warehouses : [];
  const selectedWarehouse = selection.userId === userId ? selection.warehouse : null;

  /** Pide tiendas y tienda preferida; aplica el resultado solo si sigue siendo el usuario actual. */
  const fetchFor = useCallback(
    (forUserId: string, isStillWanted: () => boolean) =>
      Promise.all([warehouseService.getActive(), warehouseService.getPreferredId()])
        .then(([data, preferredId]) => {
          if (!isStillWanted()) return;
          setResult({ userId: forUserId, warehouses: data, error: null });
          setSelection((current) => ({
            userId: forUserId,
            warehouse: pickWarehouse(
              data,
              current.userId === forUserId ? (current.warehouse?.id ?? null) : null,
              preferredId,
            ),
          }));
        })
        .catch((err) => {
          if (!isStillWanted()) return;
          setResult({
            userId: forUserId,
            warehouses: [],
            error: err instanceof Error ? err.message : 'Error al cargar las tiendas',
          });
        }),
    [],
  );

  // Carga al iniciar sesión (o cambiar de cuenta).
  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    fetchFor(userId, () => isActive);
    return () => {
      isActive = false;
    };
  }, [fetchFor, userId]);

  // Tiempo real: si una tienda abre, cierra o cambia desde la web, se recarga la lista (la
  // tienda elegida se conserva). Así el aviso de "tienda cerrada" usa el estado al día.
  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    const unsubscribe = warehouseService.subscribeToChanges(() => {
      fetchFor(userId, () => isActive);
    });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [fetchFor, userId]);

  const refreshWarehouses = useCallback(async () => {
    if (userId) await fetchFor(userId, () => true);
  }, [fetchFor, userId]);

  /** Cambia de tienda y la recuerda para la próxima vez. */
  const selectWarehouse = useCallback(
    (warehouse: Warehouse) => {
      setSelection({ userId, warehouse });
      warehouseService.setPreferred(warehouse.id).catch(() => {});
    },
    [userId],
  );

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouse,
        selectWarehouse,
        // Sin sesión no hay nada que cargar; con sesión, hasta que llegue el resultado.
        isLoading: !isCurrent,
        error: isCurrent ? result.error : null,
        refreshWarehouses,
      }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouseContext() {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouseContext must be used within a WarehouseProvider');
  }
  return context;
}
