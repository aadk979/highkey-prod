"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
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
        {
          header: "ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">{row.id}</span>
          ),
        },
        {
          header: "Account ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.accountId ?? "null"}
            </span>
          ),
        },
        {
          header: "Stripe Event Record",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.stripeEventRecordId ?? "null"}
            </span>
          ),
        },
        {
          header: "Source",
          cell: (row) => row.source,
        },
        {
          header: "Entity Type",
          cell: (row) => row.entityType,
        },
        {
          header: "Entity ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.entityId}
            </span>
          ),
        },
        {
          header: "Order ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.orderId ?? "null"}
            </span>
          ),
        },
        {
          header: "Request ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.requestId ?? "null"}
            </span>
          ),
        },
        {
          header: "Correlation ID",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-muted">
              {row.correlationId ?? "null"}
            </span>
          ),
        },
        {
          header: "IP",
          cell: (row) => row.ipAddress ?? "null",
        },
        {
          header: "User Agent",
          cell: (row) => (
            <span
              className="max-w-xs truncate block"
              title={row.userAgent ?? undefined}
            >
              {row.userAgent ?? "null"}
            </span>
          ),
        },
        {
          header: "Created At",
          cell: (row) => formatDate(row.createdAt),
        },
        {
          header: "Before",
          cell: (row) => <JsonViewer value={row.beforeData} />,
        },
        {
          header: "After",
          cell: (row) => <JsonViewer value={row.afterData} />,
        },
        {
          header: "Metadata",
          cell: (row) => <JsonViewer value={row.metadata} />,
        },
      ]}
    />
  );
}
