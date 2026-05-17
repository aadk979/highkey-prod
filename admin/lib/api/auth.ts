import { apiRequest } from "./client";
import type { Admin, LoginPayload, LoginResponse } from "@/lib/types/auth";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<LoginResponse>("/api/v1/admin/auth/login", {
      method: "POST",
      body: payload,
    }),

  logout: () =>
    apiRequest<{ message: string }>("/api/v1/admin/auth/logout", {
      method: "POST",
    }),

  me: () => apiRequest<Admin>("/api/v1/admin/auth/me"),
};
