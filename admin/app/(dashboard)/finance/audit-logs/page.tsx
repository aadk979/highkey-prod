"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatDate, formatLabel } from "@/lib/utils";
import type { AuditLog } from "@/lib/types/finance";

export default function FinanceAuditLogsPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.auditLogs(params),
    [],
  );

  return (
    <FinanceTablePage<AuditLog>
      title="Audit logs"
      fetcher={fetcher}
      orderLink={(row) => (row.orderId ? `/orders/${row.orderId}` : null)}
      columns={[
        {
          header: "When",
          cell: (row) => formatDate(row.occurredAt),
        },
        {
          header: "Actor",
          cell: (row) => (
            <Badge variant="muted">{formatLabel(row.actorType)}</Badge>
          ),
        },
        {
          header: "Action",
          cell: (row) => row.action,
        },
        {
          header: "Summary",
          cell: (row) => (
            <span className="max-w-xs truncate">{row.summary}</span>
          ),
        },
        {
          header: "OK",
          cell: (row) => (
            <Badge variant={row.success ? "success" : "error"}>
              {row.success ? "Yes" : "No"}
            </Badge>
          ),
        },
      ]}
    />
  );
}
