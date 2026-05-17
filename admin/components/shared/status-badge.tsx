import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/utils";

const orderStatusVariant: Record<string, "default" | "success" | "warning" | "error" | "muted"> = {
  received: "default",
  preparing: "warning",
  shipped_out: "default",
  delivered: "success",
  collection_scheduled: "warning",
  collected: "success",
  cancelled: "muted",
  refunded: "muted",
  disputed: "error",
};

const paymentStatusVariant: Record<string, "default" | "success" | "warning" | "error" | "muted"> = {
  pending: "warning",
  requires_action: "warning",
  paid: "success",
  failed: "error",
  cancelled: "muted",
  partially_refunded: "warning",
  refunded: "muted",
  disputed: "error",
  disputed_won: "success",
  disputed_lost: "error",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={orderStatusVariant[status] ?? "default"}>
      {formatLabel(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={paymentStatusVariant[status] ?? "default"}>
      {formatLabel(status)}
    </Badge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "muted"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
