"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatCents, formatDate } from "@/lib/utils";
import type { FinancePayment } from "@/lib/types/finance";

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

export default function FinancePaymentsPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.payments(params),
    [],
  );

  return (
    <FinanceTablePage<FinancePayment>
      title="Payments"
      fetcher={fetcher}
      expandRow={(row) => (
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {field("ID", row.id, true)}
          {field("Provider", row.provider)}
          {field(
            "Amount Received",
            formatCents(row.amountReceivedCents, row.currencyCode),
          )}
          {field(
            "Amount Refunded",
            formatCents(row.amountRefundedCents, row.currencyCode),
          )}
          {field("Stripe Checkout Session", row.stripeCheckoutSessionId, true)}
          {field("Stripe Payment Intent", row.stripePaymentIntentId, true)}
          {field("Stripe Charge ID", row.stripeChargeId, true)}
          {field("Stripe Customer ID", row.stripeCustomerId, true)}
          {field("Checkout Completed", formatDate(row.checkoutCompletedAt))}
          {field("Cancelled At", formatDate(row.cancelledAt))}
          {field("Failed At", formatDate(row.failedAt))}
          {field("Created At", formatDate(row.createdAt))}
          {field("Updated At", formatDate(row.updatedAt))}
          <div className="col-span-full">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              Raw Last Payload
            </p>
            <JsonViewer value={row.rawLastPayload} />
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
          cell: (row) => <PaymentStatusBadge status={row.status} />,
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
          header: "Paid At",
          cell: (row) => formatDate(row.paidAt),
        },
      ]}
    />
  );
}
