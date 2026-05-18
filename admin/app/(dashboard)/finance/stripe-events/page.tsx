"use client";

import { Fragment, useCallback, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JsonViewer } from "@/components/ui/json-viewer";
import { PageLoader } from "@/components/ui/spinner";
import {
  EmptyState,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Td,
  Th,
} from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination";
import { financeApi } from "@/lib/api/finance";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { formatDate, formatLabel } from "@/lib/utils";
import type { StripeEvent } from "@/lib/types/finance";

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

export default function StripeEventsPage() {
  const { isSuperAdmin } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState<string | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number }) =>
      financeApi.stripeEvents(params),
    [],
  );

  const { data, pagination, setPage, loading, error, reload } =
    usePaginatedFetch(fetcher);

  async function reprocess(id: string) {
    setReprocessing(id);
    try {
      await financeApi.reprocessStripeEvent(id);
      reload();
    } finally {
      setReprocessing(null);
    }
  }

  return (
    <AppShell title="Stripe events">
      <Card className="p-0">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-sm text-error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState title="No Stripe events" />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <Th className="w-10" />
                  <Th>Event Type</Th>
                  <Th>Status</Th>
                  <Th>Mode</Th>
                  <Th>Received At</Th>
                  <Th>Actions</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((event: StripeEvent) => {
                  const isExpanded = expandedId === event.id;
                  return (
                    <Fragment key={event.id}>
                      <TableRow
                        onClick={() =>
                          setExpandedId(isExpanded ? null : event.id)
                        }
                      >
                        <td className="w-10 px-3 py-4 text-ink-subtle">
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </td>
                        <Td>
                          <span className="font-mono text-xs text-ink">
                            {event.eventType}
                          </span>
                        </Td>
                        <Td>
                          <Badge
                            variant={
                              event.processingStatus === "processed"
                                ? "success"
                                : event.processingStatus === "failed"
                                  ? "error"
                                  : "muted"
                            }
                          >
                            {formatLabel(event.processingStatus)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            variant={
                              event.mode === "live" ? "success" : "warning"
                            }
                          >
                            {event.mode}
                          </Badge>
                        </Td>
                        <Td>{formatDate(event.receivedAt)}</Td>
                        <td
                          className="px-5 py-4 text-ink-muted"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSuperAdmin &&
                          event.processingStatus === "failed" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              loading={reprocessing === event.id}
                              onClick={() => reprocess(event.id)}
                            >
                              Reprocess
                            </Button>
                          ) : (
                            "—"
                          )}
                        </td>
                      </TableRow>
                      {isExpanded && (
                        <tr className="border-b border-hairline bg-surface-1">
                          <td colSpan={6} className="px-6 pb-6 pt-4">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                              {field("ID", event.id, true)}
                              {field(
                                "Stripe Event ID",
                                event.stripeEventId,
                                true,
                              )}
                              {field("API Version", event.apiVersion, true)}
                              {field("Object Type", event.stripeObjectType)}
                              {field("Object ID", event.stripeObjectId, true)}
                              {field(
                                "Related Order ID",
                                event.relatedOrderId,
                                true,
                              )}
                              {field(
                                "Related Payment ID",
                                event.relatedPaymentId,
                                true,
                              )}
                              {field(
                                "Related Refund ID",
                                event.relatedRefundId,
                                true,
                              )}
                              {field(
                                "Related Dispute ID",
                                event.relatedDisputeId,
                                true,
                              )}
                              {field(
                                "Signature Verified",
                                event.signatureVerified ? "Yes" : "No",
                              )}
                              {field(
                                "Stripe Created At",
                                formatDate(event.stripeCreatedAt),
                              )}
                              {field(
                                "Processed At",
                                formatDate(event.processedAt),
                              )}
                              {field("Error Message", event.errorMessage)}
                              {field("Created At", formatDate(event.createdAt))}
                              <div className="col-span-full">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                                  Payload
                                </p>
                                <JsonViewer value={event.payload} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {pagination ? (
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            ) : null}
          </>
        )}
      </Card>
    </AppShell>
  );
}
