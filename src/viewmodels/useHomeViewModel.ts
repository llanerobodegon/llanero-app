import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import type { Slider } from '@/models/slider.model';
import type { Category, Product, Warehouse } from '@/models/warehouse.model';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { useCartProductActions } from '@/viewmodels/useCartProductActions';
import { SliderPosition, sliderService } from '@/services/slider.service';

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

/**
 * Carga los slides activos de una posición (`SliderPosition`).
 */
function useSliders(position: number) {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    sliderService
      .getActiveByPosition(position)
      .then((data) => {
        if (!isActive) return;
        setSlides(data);
        setError(null);
      })
      .catch((err) => isActive && setError(errorMessage(err, 'Error al cargar los banners')))
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [position]);

  return { slides, isLoading, error };
}

/**
 * Carga una lista de productos de la tienda elegida y la recarga al cambiar de tienda.
 * Guarda de qué tienda es el resultado para saber si está al día sin poner `isLoading`
 * a mano dentro del efecto. `fetchProducts` debe ser estable (un método del servicio).
 */
function useWarehouseProducts(
  warehouseId: string | null,
  isLoadingWarehouses: boolean,
  fetchProducts: (warehouseId: string) => Promise<Product[]>,
  fallbackError: string,
) {
  const [state, setState] = useState<{
    warehouseId: string | null;
    products: Product[];
    error: string | null;
  }>({ warehouseId: null, products: [], error: null });

  useEffect(() => {
    if (!warehouseId) return;
    let isActive = true;
    fetchProducts(warehouseId)
      .then((products) => isActive && setState({ warehouseId, products, error: null }))
      .catch(
        (err) =>
          isActive &&
          setState({ warehouseId, products: [], error: errorMessage(err, fallbackError) }),
      );
    return () => {
      isActive = false;
    };
  }, [warehouseId, fetchProducts, fallbackError]);

  const isCurrent = state.warehouseId === warehouseId;
  return {
    products: isCurrent ? state.products : [],
    isLoading: !isCurrent && (isLoadingWarehouses || warehouseId !== null),
    error: isCurrent ? state.error : null,
  };
}

export function useHomeViewModel() {
  const { warehouses, selectedWarehouse, selectWarehouse, isLoading, error } =
    useWarehouseContext();
  const selectedWarehouseId = selectedWarehouse?.id ?? null;
  const cart = useCartContext();

  // Tienda a la que el cliente quiere cambiar mientras confirma que se vaciará su carrito.
  const [pendingWarehouse, setPendingWarehouse] = useState<Warehouse | null>(null);

  /** Cambia de tienda; si el carrito tiene productos de otra, pide confirmación primero. */
  const requestWarehouseChange = useCallback(
    (warehouse: Warehouse) => {
      if (warehouse.id === selectedWarehouseId) return;
      const cartHasOtherStore =
        cart.items.length > 0 && cart.warehouseId !== null && cart.warehouseId !== warehouse.id;
      if (cartHasOtherStore) {
        setPendingWarehouse(warehouse);
      } else {
        selectWarehouse(warehouse);
      }
    },
    [cart.items.length, cart.warehouseId, selectedWarehouseId, selectWarehouse],
  );

  const confirmWarehouseChange = useCallback(() => {
    if (!pendingWarehouse) return;
    cart.clear();
    selectWarehouse(pendingWarehouse);
    setPendingWarehouse(null);
  }, [cart, pendingWarehouse, selectWarehouse]);

  const cancelWarehouseChange = useCallback(() => setPendingWarehouse(null), []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    categoryService
      .getActive()
      .then((data) => {
        if (!isActive) return;
        setCategories(data);
        setCategoriesError(null);
      })
      .catch(
        (err) =>
          isActive && setCategoriesError(errorMessage(err, 'Error al cargar las categorías')),
      )
      .finally(() => isActive && setIsLoadingCategories(false));
    return () => {
      isActive = false;
    };
  }, []);

  const mainBanners = useSliders(SliderPosition.main);
  const secondaryBanners = useSliders(SliderPosition.secondary);

  const promotions = useWarehouseProducts(
    selectedWarehouseId,
    isLoading,
    productService.getPromotions,
    'Error al cargar las promociones',
  );
  const popular = useWarehouseProducts(
    selectedWarehouseId,
    isLoading,
    productService.getPopular,
    'Error al cargar los productos populares',
  );
  const market = useWarehouseProducts(
    selectedWarehouseId,
    isLoading,
    productService.getMarket,
    'Error al cargar los productos de mercado',
  );

  /** Botón del carrito en la barra superior. */
  const openCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cart.open();
  }, [cart]);

  const { getCartQuantity, addToCart, incrementProduct, decrementProduct } =
    useCartProductActions(selectedWarehouseId);

  /** Abre el detalle del producto (modal). */
  const openProduct = useCallback((product: Product) => {
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  }, []);
  /** Abre la categoría con sus subcategorías. */
  const openCategory = useCallback((category: Category) => {
    Haptics.selectionAsync();
    router.push({ pathname: '/category/[id]', params: { id: category.id } });
  }, []);

  return {
    warehouses,
    selectedWarehouse,
    selectWarehouse: requestWarehouseChange,
    pendingWarehouse,
    confirmWarehouseChange,
    cancelWarehouseChange,
    isLoadingWarehouses: isLoading,
    warehousesError: error,

    categories,
    isLoadingCategories,
    categoriesError,
    openCategory,

    mainBanners: mainBanners.slides,
    isLoadingMainBanners: mainBanners.isLoading,
    mainBannersError: mainBanners.error,
    secondaryBanners: secondaryBanners.slides,
    isLoadingSecondaryBanners: secondaryBanners.isLoading,
    secondaryBannersError: secondaryBanners.error,

    promotions: promotions.products,
    isLoadingPromotions: promotions.isLoading,
    promotionsError: promotions.error,
    popular: popular.products,
    isLoadingPopular: popular.isLoading,
    popularError: popular.error,
    market: market.products,
    isLoadingMarket: market.isLoading,
    marketError: market.error,

    addToCart,
    getCartQuantity,
    incrementProduct,
    decrementProduct,
    cartCount: cart.itemCount,
    openCart,
    openProduct,
  };
}
