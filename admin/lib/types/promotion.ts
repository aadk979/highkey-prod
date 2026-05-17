import type { Product } from "./product";

export interface Promotion {
  id: string;
  productId: string | null;
  storeWide: boolean;
  discountPercentage: number | null;
  discountValueCents: number | null;
  startDate: string;
  endDate: string;
  trackByPhone: boolean;
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product | null;
}

export interface CreatePromotionPayload {
  productId?: string | null;
  storeWide?: boolean;
  discountPercentage?: number | null;
  discountValueCents?: number | null;
  startDate: string;
  endDate: string;
  trackByPhone?: boolean;
  usageLimit?: number | null;
  isActive?: boolean;
}

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;
