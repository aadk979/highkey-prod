"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatCents, formatDate, formatLabel } from "@/lib/utils";
import type { FinanceRefund } from "@/lib/types/finance";

function field(label: string, value: React.ReactNode, mono = false) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
        {label}
      </p>
      {value === null || value === undefined ? (
        <p className="text-sm italic text-ink-muted">null</p>
      ) : mono ? (
        <p className="break-all font-mono text-xs text-ink">
          {value as string}
        </p>
      ) : (
        <p className="text-sm text-ink">{value}</p>
      )}
    </div>
  );
}

export default function FinanceRefundsPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.refunds(params),
    [],
  );

  return (
    <FinanceTablePage<FinanceRefund>
      title="Refunds"
      fetcher={fetcher}
      expandRow={(row) => (
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {field("ID", row.id, true)}
          {field("Payment ID", row.paymentId, true)}
          {field("Order ID", row.orderId, true)}
          {field("Stripe Refund ID", row.stripeRefundId, true)}
          {field("Currency", row.currencyCode)}
          {field("Reason", row.reason)}
          {field("Failure Reason", row.failureReason)}
          {field("Created At", formatDate(row.createdAt))}
          {field("Updated At", formatDate(row.updatedAt))}
          <div className="col-span-full">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              Raw Payload
            </p>
            <JsonViewer value={row.rawPayload} />
          </div>
        </div>
      )}
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
          cell: (row) => (
            <div>
              <p className="text-sm text-ink">
                {row.order?.customerName ?? "—"}
              </p>
              <p className="text-xs text-ink-subtle">
                {row.order?.customerEmail ?? "—"}
              </p>
            </div>
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
          header: "Refunded At",
          cell: (row) => formatDate(row.refundedAt),
        },
      ]}
    />
  );
}
