import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

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

/** Tienda seleccionada por el cliente. Todo el catálogo se filtra por ella. */
export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyWarehouses = useCallback((data: Warehouse[]) => {
    setWarehouses(data);
    setError(null);
    // Conserva la selección si sigue existiendo; si no, elige la primera abierta.
    setSelectedWarehouse(
      (current) =>
        data.find((w) => w.id === current?.id) ?? data.find((w) => w.isOpen) ?? data[0] ?? null,
    );
  }, []);

  const handleError = useCallback((err: unknown) => {
    setError(err instanceof Error ? err.message : 'Error al cargar las tiendas');
  }, []);

  useEffect(() => {
    let isActive = true;
    warehouseService
      .getActive()
      .then((data) => isActive && applyWarehouses(data))
      .catch((err) => isActive && handleError(err))
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [applyWarehouses, handleError]);

  const refreshWarehouses = useCallback(async () => {
    setIsLoading(true);
    try {
      applyWarehouses(await warehouseService.getActive());
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [applyWarehouses, handleError]);

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouse,
        selectWarehouse: setSelectedWarehouse,
        isLoading,
        error,
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
