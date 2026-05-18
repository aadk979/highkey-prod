"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatCents, formatDate } from "@/lib/utils";
import type { FinancePayment } from "@/lib/types/finance";

export default function FinancePaymentsPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.payments(params),
    [],
  );

  return (
    <FinanceTablePage<FinancePayment>
      title="Payments"
      fetcher={fetcher}
      orderLink={(row) => `/orders/${row.orderId}`}
      columns={[
        {
          header: "Order",
          cell: (row) => (
            <span className="font-medium text-ink">
              #{row.order?.orderNumber}
            </span>
          ),
        },
        {
          header: "Customer",
          cell: (row) => row.order?.customerName ?? "—",
        },
        {
          header: "Amount",
          cell: (row) => formatCents(row.amountCents, row.currencyCode),
        },
        {
          header: "Status",
          cell: (row) => <PaymentStatusBadge status={row.status} />,
        },
        {
          header: "Paid",
          cell: (row) => formatDate(row.paidAt),
        },
        {
          header: "ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">{row.id}</span>
          ),
        },
        {
          header: "Provider",
          cell: (row) => row.provider,
        },
        {
          header: "Mode",
          cell: (row) => (
            <Badge variant={row.mode === "live" ? "success" : "warning"}>
              {row.mode}
            </Badge>
          ),
        },
        {
          header: "Amt Received",
          cell: (row) => formatCents(row.amountReceivedCents, row.currencyCode),
        },
        {
          header: "Amt Refunded",
          cell: (row) => formatCents(row.amountRefundedCents, row.currencyCode),
        },
        {
          header: "Stripe Checkout Session",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripeCheckoutSessionId ?? "null"}
            </span>
          ),
        },
        {
          header: "Stripe Payment Intent",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripePaymentIntentId ?? "null"}
            </span>
          ),
        },
        {
          header: "Stripe Charge",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripeChargeId ?? "null"}
            </span>
          ),
        },
        {
          header: "Stripe Customer",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripeCustomerId ?? "null"}
            </span>
          ),
        },
        {
          header: "Checkout Completed",
          cell: (row) => formatDate(row.checkoutCompletedAt),
        },
        {
          header: "Cancelled At",
          cell: (row) => formatDate(row.cancelledAt),
        },
        {
          header: "Failed At",
          cell: (row) => formatDate(row.failedAt),
        },
        {
          header: "Created At",
          cell: (row) => formatDate(row.createdAt),
        },
        {
          header: "Updated At",
          cell: (row) => formatDate(row.updatedAt),
        },
        {
          header: "Raw Payload",
          cell: (row) => <JsonViewer value={row.rawLastPayload} />,
        },
      ]}
    />
  );
}
