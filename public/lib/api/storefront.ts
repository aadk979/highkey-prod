import { apiFetch } from "@/lib/api/client";
import type {
  CheckoutQuote,
  CheckoutQuoteRequest,
  CheckoutSession,
  CheckoutSessionRequest,
  CollectionLocation,
  Order,
  PaginatedProducts,
  PaginatedPromotions,
  Product,
  ProductImage,
} from "@/lib/types/storefront";

export async function listProducts(params?: {
  page?: number;
  limit?: number;
  type?: "base" | "accessory";
}): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.type) query.set("type", params.type);
  const qs = query.toString();
  return apiFetch<PaginatedProducts>(
    `/api/v1/products${qs ? `?${qs}` : ""}`
  );
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/v1/products/${id}`);
}

export async function getCustomisationTemplates(
  id: string
): Promise<{ images: ProductImage[] }> {
  return apiFetch<{ images: ProductImage[] }>(
    `/api/v1/products/${id}/customisation-templates`
  );
}

export async function listCollectionLocations(): Promise<
  CollectionLocation[]
> {
  return apiFetch<CollectionLocation[]>("/api/v1/collection-locations");
}

export async function listPromotions(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedPromotions> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<PaginatedPromotions>(
    `/api/v1/promotions${qs ? `?${qs}` : ""}`
  );
}

export async function getCheckoutQuote(
  body: CheckoutQuoteRequest
): Promise<CheckoutQuote> {
  return apiFetch<CheckoutQuote>("/api/v1/checkout/quote", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createCheckoutSession(
  body: CheckoutSessionRequest
): Promise<CheckoutSession> {
  return apiFetch<CheckoutSession>("/api/v1/checkout/session", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getOrder(publicToken: string): Promise<Order> {
  return apiFetch<Order>(`/api/v1/orders/${publicToken}`);
}
