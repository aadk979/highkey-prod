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

function currentWindowOrigin() {
  return typeof window === "undefined" ? undefined : window.origin;
}

export function replaceImageUrlOrigin(url: string, origin: string) {
  try {
    const parsed = new URL(url);
    return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url.startsWith("/") ? `${origin}${url}` : url;
  }
}

export function replaceImageOrigins(
  obj: unknown,
  origin = currentWindowOrigin()
): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (!origin) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceImageOrigins(item, origin));
  }

  const newObj: Record<string, unknown> = {
    ...(obj as Record<string, unknown>),
  };
  for (const key in newObj) {
    const val = newObj[key];
    if ((key === "imageIds" || key === "customisationImageIds") && Array.isArray(val)) {
      newObj[key] = val.map((url: string) => replaceImageUrlOrigin(url, origin));
    } else if (key === "url" && typeof val === "string" && (val.includes("/uploads/") || val.startsWith("http"))) {
      newObj[key] = replaceImageUrlOrigin(val, origin);
    } else if (typeof val === "object" && val !== null) {
      newObj[key] = replaceImageOrigins(val, origin);
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
