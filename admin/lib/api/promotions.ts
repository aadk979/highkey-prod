import { apiRequest } from "./client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  CreatePromotionPayload,
  Promotion,
  UpdatePromotionPayload,
} from "@/lib/types/promotion";

export const promotionsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiRequest<PaginatedResponse<Promotion>>("/api/v1/admin/promotions", {
      params,
    }),

  get: (id: string) =>
    apiRequest<Promotion>(`/api/v1/admin/promotions/${id}`),

  create: (payload: CreatePromotionPayload) =>
    apiRequest<Promotion>("/api/v1/admin/promotions", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdatePromotionPayload) =>
    apiRequest<Promotion>(`/api/v1/admin/promotions/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  activate: (id: string) =>
    apiRequest<Promotion>(`/api/v1/admin/promotions/${id}/activate`, {
      method: "PATCH",
    }),

  deactivate: (id: string) =>
    apiRequest<Promotion>(`/api/v1/admin/promotions/${id}/deactivate`, {
      method: "PATCH",
    }),
};
