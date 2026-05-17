import { apiRequest } from "./client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  AuditLog,
  FinanceDispute,
  FinancePayment,
  FinanceRefund,
  StripeEvent,
  StripeEventProcessingStatus,
} from "@/lib/types/finance";

export const financeApi = {
  payments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    orderId?: string;
  }) =>
    apiRequest<PaginatedResponse<FinancePayment>>(
      "/api/v1/admin/finance/payments",
      { params },
    ),

  refunds: (params?: {
    page?: number;
    limit?: number;
    orderId?: string;
    status?: string;
  }) =>
    apiRequest<PaginatedResponse<FinanceRefund>>(
      "/api/v1/admin/finance/refunds",
      { params },
    ),

  disputes: (params?: {
    page?: number;
    limit?: number;
    orderId?: string;
    status?: string;
  }) =>
    apiRequest<PaginatedResponse<FinanceDispute>>(
      "/api/v1/admin/finance/disputes",
      { params },
    ),

  stripeEvents: (params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    processingStatus?: StripeEventProcessingStatus;
  }) =>
    apiRequest<PaginatedResponse<StripeEvent>>(
      "/api/v1/admin/finance/stripe-events",
      { params },
    ),

  auditLogs: (params?: {
    page?: number;
    limit?: number;
    actorType?: string;
    entityType?: string;
    accountId?: string;
    orderId?: string;
    action?: string;
  }) =>
    apiRequest<PaginatedResponse<AuditLog>>(
      "/api/v1/admin/finance/audit-logs",
      { params },
    ),

  reprocessStripeEvent: (id: string) =>
    apiRequest<{ reprocessed: boolean }>(
      `/api/v1/admin/finance/stripe-events/${id}/reprocess`,
      { method: "POST" },
    ),
};
