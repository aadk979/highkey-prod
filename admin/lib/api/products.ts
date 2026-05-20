import { apiRequest } from "./client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  CreateProductPayload,
  Product,
  ProductImage,
  ProductType,
  UpdateProductPayload,
} from "@/lib/types/product";

export const productsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    type?: ProductType;
    search?: string;
  }) =>
    apiRequest<PaginatedResponse<Product>>("/api/v1/admin/products", {
      params,
    }),

  get: (id: string) =>
    apiRequest<Product>(`/api/v1/admin/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiRequest<Product>("/api/v1/admin/products", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateProductPayload) =>
    apiRequest<Product>(`/api/v1/admin/products/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  adjustStock: (id: string, delta: number) =>
    apiRequest<Product>(`/api/v1/admin/products/${id}/stock`, {
      method: "PATCH",
      body: { delta },
    }),

  activate: (id: string) =>
    apiRequest<Product>(`/api/v1/admin/products/${id}/activate`, {
      method: "PATCH",
    }),

  deactivate: (id: string) =>
    apiRequest<Product>(`/api/v1/admin/products/${id}/deactivate`, {
      method: "PATCH",
    }),

  getImages: (id: string) =>
    apiRequest<{ images: ProductImage[] }>(
      `/api/v1/admin/products/${id}/images`,
    ),

  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append("images", file);
    return apiRequest<{
      productId: string;
      uploadedImages: ProductImage[];
      totalImages: number;
    }>(`/api/v1/admin/products/${id}/images`, {
      method: "POST",
      body: form,
    });
  },

  deleteImage: (id: string, imageId: string) =>
    apiRequest<{
      productId: string;
      deletedImageId: string;
      remainingImages: number;
    }>(`/api/v1/admin/products/${id}/images/delete`, {
      method: "DELETE",
      body: { imageId },
    }),

  getCustomisationTemplates: (id: string) =>
    apiRequest<{ images: ProductImage[] }>(
      `/api/v1/admin/products/${id}/customisation-templates`,
    ),

  uploadCustomisationTemplates: (id: string, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append("images", file);
    return apiRequest<{
      productId: string;
      uploadedImages: ProductImage[];
      totalImages: number;
    }>(`/api/v1/admin/products/${id}/customisation-templates`, {
      method: "POST",
      body: form,
    });
  },

  deleteCustomisationTemplate: (id: string, imageId: string) =>
    apiRequest<{
      productId: string;
      deletedImageId: string;
      remainingImages: number;
    }>(`/api/v1/admin/products/${id}/customisation-templates/${imageId}`, {
      method: "DELETE",
    }),
};
