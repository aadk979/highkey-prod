export type ProductType = "base" | "accessory";

export interface ProductDimensions {
  maxWidthMm?: number;
  maxHeightMm?: number;
  minWidthMm?: number;
  minHeightMm?: number;
  maxPatches?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  productType: ProductType;
  isCustomizable: boolean;
  basePriceCents: number;
  currencyCode: string;
  imageIds: string[];
  dimensions: ProductDimensions | null;
  isActive: boolean;
  availableStock: number;
  customisationImageIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  filename?: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  productType: ProductType;
  isCustomizable?: boolean;
  basePriceCents: number;
  currencyCode?: string;
  imageIds?: string[];
  customisationImageIds?: string[];
  dimensions?: ProductDimensions;
  isActive?: boolean;
  availableStock?: number;
}

export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, "availableStock">
>;
