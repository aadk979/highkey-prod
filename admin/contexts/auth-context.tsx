"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/types/common";
import type { Admin, LoginPayload } from "@/lib/types/auth";

interface AuthContextValue {
  admin: Admin | null;
  loading: boolean;
  isSuperAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const profile = await authApi.me();
      setAdmin(profile);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAdmin(null);
      }
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await authApi.login(payload);
      setAdmin(res.admin);
      router.push("/");
      router.refresh();
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isSuperAdmin: admin?.role === "super_admin",
      login,
      logout,
      refresh,
    }),
    [admin, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
