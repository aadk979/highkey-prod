import type { ApiError } from "@/lib/types/storefront";

const baseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }
  return url.replace(/\/$/, "");
};

export class StorefrontApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StorefrontApiError";
    this.status = status;
  }
}

function replaceImageOrigins(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (typeof window === "undefined") return obj;

  if (Array.isArray(obj)) {
    return obj.map(replaceImageOrigins);
  }

  const newObj: Record<string, unknown> = {
    ...(obj as Record<string, unknown>),
  };
  for (const key in newObj) {
    const val = newObj[key];
    if ((key === "imageIds" || key === "customisationImageIds") && Array.isArray(val)) {
      newObj[key] = val.map((url: string) => {
        try {
          const u = new URL(url);
          return window.origin + u.pathname + u.search;
        } catch {
          return url.startsWith("/") ? window.origin + url : url;
        }
      });
    } else if (key === "url" && typeof val === "string" && (val.includes("/uploads/") || val.startsWith("http"))) {
      try {
        const u = new URL(val);
        newObj[key] = window.origin + u.pathname + u.search;
      } catch {
        if (val.startsWith("/")) newObj[key] = window.origin + val;
      }
    } else if (typeof val === "object" && val !== null) {
      newObj[key] = replaceImageOrigins(val);
    }
  }
  return newObj;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (json as ApiError).error ??
      `Request failed (${response.status})`;
    throw new StorefrontApiError(message, response.status);
  }

  return replaceImageOrigins(json) as T;
}
