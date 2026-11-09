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
