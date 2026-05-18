"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatCents, formatDate, formatLabel } from "@/lib/utils";
import type { FinanceRefund } from "@/lib/types/finance";

export default function FinanceRefundsPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.refunds(params),
    [],
  );

  return (
    <FinanceTablePage<FinanceRefund>
      title="Refunds"
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
          header: "Amount",
          cell: (row) => formatCents(row.amountCents, row.currencyCode),
        },
        {
          header: "Status",
          cell: (row) => (
            <Badge variant="muted">{formatLabel(row.status)}</Badge>
          ),
        },
        {
          header: "Refunded",
          cell: (row) => formatDate(row.refundedAt),
        },
        {
          header: "ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">{row.id}</span>
          ),
        },
        {
          header: "Payment ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.paymentId}
            </span>
          ),
        },
        {
          header: "Order ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.orderId}
            </span>
          ),
        },
        {
          header: "Stripe Refund ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripeRefundId}
            </span>
          ),
        },
        {
          header: "Currency",
          cell: (row) => row.currencyCode,
        },
        {
          header: "Reason",
          cell: (row) => row.reason ?? "null",
        },
        {
          header: "Failure Reason",
          cell: (row) => row.failureReason ?? "null",
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
          cell: (row) => <JsonViewer value={row.rawPayload} />,
        },
      ]}
    />
  );
}
