import type { Order, Payment, PaymentDispute, PaymentRefund } from "./order";
import type { AuditLog } from "./order";

export type StripeEventProcessingStatus =
  | "received"
  | "processing"
  | "processed"
  | "failed"
  | "ignored";

export interface StripeEvent {
  id: string;
  stripeEventId: string;
  mode: "test" | "live";
  eventType: string;
  apiVersion: string | null;
  stripeObjectType: string | null;
  stripeObjectId: string | null;
  relatedOrderId: string | null;
  relatedPaymentId: string | null;
  relatedRefundId: string | null;
  relatedDisputeId: string | null;
  signatureVerified: boolean;
  processingStatus: StripeEventProcessingStatus;
  stripeCreatedAt: string | null;
  receivedAt: string;
  processedAt: string | null;
  errorMessage: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface FinancePayment extends Payment {
  order: Order;
}

export interface FinanceRefund extends PaymentRefund {
  order: Order;
  payment: Payment;
}

export interface FinanceDispute extends PaymentDispute {
  order: Order;
  payment: Payment;
}

export type { AuditLog };
