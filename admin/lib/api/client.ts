import { ApiError } from "@/lib/types/common";

/** Backend origin; only read in the browser (client components / hooks). */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null> | object;
};

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }
  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message
      : res.statusText || "Request failed";
  return new ApiError(message, res.status, body);
}

function replaceImageOrigins(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (typeof window === "undefined") return obj;

  if (Array.isArray(obj)) {
    return obj.map(replaceImageOrigins);
  }

  const newObj: any = { ...obj };
  for (const key in newObj) {
    const val = newObj[key];
    if ((key === "imageIds" || key === "customisationImageIds" || key === "customisationImageIds") && Array.isArray(val)) {
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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, headers: customHeaders, ...init } = options;
  const headers = new Headers(customHeaders);

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path, params), {
    ...init,
    headers,
    body: requestBody,
    credentials: "include",
  });

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const json = await res.json();
    return replaceImageOrigins(json) as Promise<T>;
  }
  return undefined as T;
}
