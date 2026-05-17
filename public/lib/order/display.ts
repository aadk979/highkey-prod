import type { OrderStatus, PaymentStatus } from "@/lib/types/storefront";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order received",
  preparing: "Preparing your piece",
  shipped_out: "Shipped out",
  delivered: "Delivered",
  collection_scheduled: "Collection scheduled",
  collected: "Collected",
  cancelled: "Cancelled",
  refunded: "Refunded",
  disputed: "Disputed",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  requires_action: "Action required",
  paid: "Paid",
  failed: "Payment failed",
  cancelled: "Payment cancelled",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  disputed: "Disputed",
  disputed_won: "Dispute won",
  disputed_lost: "Dispute lost",
};

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fulfillmentLabel(method: "self_collect" | "delivery"): string {
  return method === "self_collect" ? "Self collect" : "Delivery";
}

export function orderStatusTone(
  status: OrderStatus
): "neutral" | "active" | "success" | "warning" | "danger" {
  switch (status) {
    case "received":
    case "preparing":
      return "active";
    case "shipped_out":
    case "collection_scheduled":
      return "warning";
    case "delivered":
    case "collected":
      return "success";
    case "cancelled":
    case "refunded":
      return "danger";
    case "disputed":
      return "warning";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(
  status: PaymentStatus
): "neutral" | "active" | "success" | "warning" | "danger" {
  switch (status) {
    case "paid":
    case "disputed_won":
      return "success";
    case "pending":
    case "requires_action":
      return "warning";
    case "failed":
    case "cancelled":
    case "disputed_lost":
      return "danger";
    case "partially_refunded":
    case "refunded":
    case "disputed":
      return "neutral";
    default:
      return "neutral";
  }
}

export const BADGE_STYLES = {
  neutral: "bg-surface text-muted border-border",
  active: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-800 border-amber-500/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
} as const;

export function getStatusSteps(
  fulfillmentMethod: "self_collect" | "delivery"
): { key: OrderStatus; label: string }[] {
  if (fulfillmentMethod === "self_collect") {
    return [
      { key: "received", label: "Received" },
      { key: "preparing", label: "Preparing" },
      { key: "collection_scheduled", label: "Ready" },
      { key: "collected", label: "Collected" },
    ];
  }
  return [
    { key: "received", label: "Received" },
    { key: "preparing", label: "Preparing" },
    { key: "shipped_out", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];
}

export function stepIndexForStatus(
  status: OrderStatus,
  steps: { key: OrderStatus }[]
): number {
  if (status === "cancelled" || status === "refunded" || status === "disputed") {
    return -1;
  }
  const idx = steps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function formatMetaKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
