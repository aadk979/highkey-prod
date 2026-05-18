"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { FinanceTablePage } from "@/components/finance/finance-table-page";
import { financeApi } from "@/lib/api/finance";
import { formatDate, formatLabel } from "@/lib/utils";
import type { AuditLog } from "@/lib/types/finance";

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

export default function FinanceAuditLogsPage() {
  const fetcher = useCallback(
    (params: { page: number; limit: number }) => financeApi.auditLogs(params),
    [],
  );

  return (
    <FinanceTablePage<AuditLog>
      title="Audit logs"
      fetcher={fetcher}
      expandRow={(row) => (
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {field("ID", row.id, true)}
          {field("Account ID", row.accountId, true)}
          {field("Stripe Event Record ID", row.stripeEventRecordId, true)}
          {field("Source", row.source)}
          {field("Entity Type", row.entityType)}
          {field("Entity ID", row.entityId, true)}
          {field("Order ID", row.orderId, true)}
          {field("Request ID", row.requestId, true)}
          {field("Correlation ID", row.correlationId, true)}
          {field("IP Address", row.ipAddress)}
          {field("User Agent", row.userAgent)}
          {field("Created At", formatDate(row.createdAt))}
          <div className="col-span-full">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              Before Data
            </p>
            <JsonViewer value={row.beforeData} />
          </div>
          <div className="col-span-full">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              After Data
            </p>
            <JsonViewer value={row.afterData} />
          </div>
          <div className="col-span-full">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              Metadata
            </p>
            <JsonViewer value={row.metadata} />
          </div>
        </div>
      )}
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
          cell: (row) => row.summary,
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
