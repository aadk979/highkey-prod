import type { Product } from "./product";
import type { Promotion } from "./promotion";
import type { CollectionLocation } from "./location";

export type OrderStatus =
  | "received"
  | "preparing"
  | "shipped_out"
  | "delivered"
  | "collection_scheduled"
  | "collected"
  | "cancelled"
  | "refunded"
  | "disputed";

export type PaymentStatus =
  | "pending"
  | "requires_action"
  | "paid"
  | "failed"
  | "cancelled"
  | "partially_refunded"
  | "refunded"
  | "disputed"
  | "disputed_won"
  | "disputed_lost";

export type FulfillmentMethod = "self_collect" | "delivery";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  appliedPromotionId: string | null;
  snapshotName: string;
  snapshotSlug: string;
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  lineTotalCents: number;
  createdAt: string;
  product?: Product | null;
  appliedPromotion?: Promotion | null;
}

export interface PaymentRefund {
  id: string;
  paymentId: string;
  orderId: string;
  stripeRefundId: string;
  amountCents: number;
  currencyCode: string;
  status: string;
  reason: string | null;
  failureReason: string | null;
  refundedAt: string | null;
  rawPayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDispute {
  id: string;
  paymentId: string;
  orderId: string;
  stripeDisputeId: string;
  amountCents: number;
  currencyCode: string;
  reason: string | null;
  status: string;
  dueBy: string | null;
  evidenceSubmittedAt: string | null;
  wonAt: string | null;
  lostAt: string | null;
  rawPayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  mode: "test" | "live";
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  status: string;
  amountCents: number;
  amountReceivedCents: number;
  amountRefundedCents: number;
  currencyCode: string;
  stripeCustomerId: string | null;
  checkoutCompletedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  failedAt: string | null;
  rawLastPayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  refunds?: PaymentRefund[];
  disputes?: PaymentDispute[];
  order?: OrderSummary;
}

export interface Order {
  id: string;
  orderNumber: number;
  publicToken: string;
  customerName: string;
  customerEmail: string;
  countryCode: string;
  customerPhone: string;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddress: string | null;
  collectionLocationId: string | null;
  subtotalCents: number;
  discountTotalCents: number;
  taxTotalCents: number;
  shippingTotalCents: number;
  grandTotalCents: number;
  refundedAmountCents: number;
  currencyCode: string;
  promotionId: string | null;
  customizationMeta: Record<string, unknown> | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  customerNote: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  disputeReason: string | null;
  disputeStatus: string | null;
  disputeDueBy: string | null;
  disputedAt: string | null;
  disputeResolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payments?: Payment[];
  promotion?: Promotion | null;
  collectionLocation?: CollectionLocation | null;
}

export type OrderSummary = Pick<
  Order,
  | "id"
  | "orderNumber"
  | "customerName"
  | "customerEmail"
  | "orderStatus"
  | "paymentStatus"
  | "grandTotalCents"
  | "currencyCode"
  | "createdAt"
>;

export interface AuditLog {
  id: string;
  occurredAt: string;
  actorType: "admin" | "system" | "stripe_webhook";
  accountId: string | null;
  stripeEventRecordId: string | null;
  source: string;
  action: string;
  entityType: string;
  entityId: string;
  orderId: string | null;
  requestId: string | null;
  correlationId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  summary: string;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  success: boolean;
  createdAt: string;
}
