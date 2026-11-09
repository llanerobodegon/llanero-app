import { useWarehouseContext } from '@/contexts/warehouse-context';

export function useHomeViewModel() {
  const { warehouses, selectedWarehouse, selectWarehouse, isLoading, error } =
    useWarehouseContext();

  return {
    warehouses,
    selectedWarehouse,
    selectWarehouse,
    isLoadingWarehouses: isLoading,
    warehousesError: error,
  };
}
