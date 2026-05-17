"use client";

import { useCallback } from "react";
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
            <span className="font-medium text-ink">#{row.order?.orderNumber}</span>
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
      ]}
    />
  );
}
