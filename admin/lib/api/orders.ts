import { apiRequest } from "./client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  AuditLog,
  Order,
  OrderStatus,
  Payment,
  PaymentStatus,
} from "@/lib/types/order";

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  email?: string;
  phone?: string;
  orderNumber?: number;
  from?: string;
  to?: string;
  /** Pass true to return only roadshow orders (customizationMeta.isRoadshow === true) */
  roadshow?: boolean;
}

export const ordersApi = {
  list: (params?: OrderListParams) =>
    apiRequest<PaginatedResponse<Order>>("/api/v1/admin/orders", { params }),

  get: (id: string) => apiRequest<Order>(`/api/v1/admin/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<Order>(`/api/v1/admin/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  cancel: (id: string) =>
    apiRequest<Order>(`/api/v1/admin/orders/${id}/cancel`, { method: "POST" }),

  refund: (
    id: string,
    payload: {
      amountCents?: number;
      full?: boolean;
      reason?: string;
      note?: string;
    },
  ) =>
    apiRequest<{ message: string; orderId: string; stripeRefundId: string }>(
      `/api/v1/admin/orders/${id}/refunds`,
      { method: "POST", body: payload },
    ),

  payments: (id: string) =>
    apiRequest<Payment[]>(`/api/v1/admin/orders/${id}/payments`),

  auditLogs: (id: string, params?: { page?: number; limit?: number }) =>
    apiRequest<PaginatedResponse<AuditLog>>(
      `/api/v1/admin/orders/${id}/audit-logs`,
      { params },
    ),

  paymentLink: (id: string) =>
    apiRequest<{
      orderId: string;
      orderNumber: number;
      paymentId: string;
      checkoutUrl: string;
    }>(`/api/v1/admin/orders/${id}/payment-link`, { method: "POST" }),
};

export interface RoadshowSalePayload {
  priceCents: number;
  location: string;
  description?: string;
}

export interface RoadshowSaleResult {
  checkoutUrl: string;
  qrCode: string;
  sessionId: string;
}

export const roadshowApi = {
  create: (payload: RoadshowSalePayload) =>
    apiRequest<RoadshowSaleResult>("/api/v1/admin/orders/roadshow/create", {
      method: "POST",
      body: payload,
    }),
};
