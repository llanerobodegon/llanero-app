// Mismos nombres que llanero-web/src/models/slider.model.ts

export interface Slider {
  id: string;
  name: string;
  position: number; // 1 = Slider principal, 2 = Slider secundario
  slot: number; // 1, 2, 3
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}
