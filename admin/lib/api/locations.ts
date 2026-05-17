import { apiRequest } from "./client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  CollectionLocation,
  CreateLocationPayload,
  UpdateLocationPayload,
} from "@/lib/types/location";

export const locationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiRequest<PaginatedResponse<CollectionLocation>>(
      "/api/v1/admin/collection-locations",
      { params },
    ),

  get: (id: string) =>
    apiRequest<CollectionLocation>(
      `/api/v1/admin/collection-locations/${id}`,
    ),

  create: (payload: CreateLocationPayload) =>
    apiRequest<CollectionLocation>("/api/v1/admin/collection-locations", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateLocationPayload) =>
    apiRequest<CollectionLocation>(
      `/api/v1/admin/collection-locations/${id}`,
      { method: "PATCH", body: payload },
    ),

  activate: (id: string) =>
    apiRequest<CollectionLocation>(
      `/api/v1/admin/collection-locations/${id}/activate`,
      { method: "PATCH" },
    ),

  deactivate: (id: string) =>
    apiRequest<CollectionLocation>(
      `/api/v1/admin/collection-locations/${id}/deactivate`,
      { method: "PATCH" },
    ),
};
