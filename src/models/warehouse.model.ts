// Mismos nombres que llanero-web/src/models/warehouse.model.ts

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  deliveryFee: number;
  isActive: boolean;
  isOpen: boolean;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Producto del catálogo. Precio, descuento y promo dependen de la tienda
 * (`warehouse_products`); el servicio los entrega ya resueltos para la tienda elegida.
 */
export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  subcategoryId: string | null;
  subcategory?: Subcategory;
  name: string;
  description: string | null;
  imageUrls: string[];
  barcode: string | null;
  sku: string | null;
  price: number;
  isActive: boolean;
  isOnDiscount: boolean;
  isPromo: boolean;
  discountPrice: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}
