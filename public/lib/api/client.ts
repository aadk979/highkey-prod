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

  return json as T;
}
