export type AdminRole = "admin" | "super_admin";

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive?: boolean;
  lastLoginAt?: string | null;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  admin: Admin;
}
