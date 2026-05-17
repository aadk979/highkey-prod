"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
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
            <span className="font-medium text-ink">#{row.order?.orderNumber}</span>
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
      ]}
    />
  );
}
