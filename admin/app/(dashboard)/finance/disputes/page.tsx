"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatCents, formatDate, formatLabel } from "@/lib/utils";
import type { FinanceDispute } from "@/lib/types/finance";

export default function FinanceDisputesPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.disputes(params),
    [],
  );

  return (
    <FinanceTablePage<FinanceDispute>
      title="Disputes"
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
            <Badge variant="error">{formatLabel(row.status)}</Badge>
          ),
        },
        {
          header: "Due by",
          cell: (row) => formatDate(row.dueBy),
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
          header: "Stripe Dispute ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripeDisputeId}
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
          header: "Evidence Submitted",
          cell: (row) => formatDate(row.evidenceSubmittedAt),
        },
        {
          header: "Won At",
          cell: (row) => formatDate(row.wonAt),
        },
        {
          header: "Lost At",
          cell: (row) => formatDate(row.lostAt),
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
