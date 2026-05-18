"use client";

import { useCallback, useState } from "react";
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

export default function StripeEventsPage() {
  const { isSuperAdmin } = useAuth();
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
                  <Th>Event</Th>
                  <Th>Status</Th>
                  <Th>Received</Th>
                  <Th>Actions</Th>
                  <Th>ID</Th>
                  <Th>Stripe Event ID</Th>
                  <Th>Mode</Th>
                  <Th>API Version</Th>
                  <Th>Object Type</Th>
                  <Th>Object ID</Th>
                  <Th>Related Order</Th>
                  <Th>Related Payment</Th>
                  <Th>Related Refund</Th>
                  <Th>Related Dispute</Th>
                  <Th>Sig Verified</Th>
                  <Th>Stripe Created</Th>
                  <Th>Processed At</Th>
                  <Th>Error</Th>
                  <Th>Created At</Th>
                  <Th>Payload</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((event) => (
                  <TableRow key={event.id}>
                    <Td className="font-mono text-xs text-ink">
                      {event.eventType}
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
                    <Td>{formatDate(event.receivedAt)}</Td>
                    <Td>
                      {isSuperAdmin && event.processingStatus === "failed" ? (
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
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.id}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.stripeEventId}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        variant={event.mode === "live" ? "success" : "warning"}
                      >
                        {event.mode}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.apiVersion ?? "null"}
                      </span>
                    </Td>
                    <Td>{event.stripeObjectType ?? "null"}</Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.stripeObjectId ?? "null"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.relatedOrderId ?? "null"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.relatedPaymentId ?? "null"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.relatedRefundId ?? "null"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-ink-muted">
                        {event.relatedDisputeId ?? "null"}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        variant={event.signatureVerified ? "success" : "error"}
                      >
                        {event.signatureVerified ? "true" : "false"}
                      </Badge>
                    </Td>
                    <Td>{formatDate(event.stripeCreatedAt)}</Td>
                    <Td>{formatDate(event.processedAt)}</Td>
                    <Td>{event.errorMessage ?? "null"}</Td>
                    <Td>{formatDate(event.createdAt)}</Td>
                    <Td>
                      <JsonViewer value={event.payload} />
                    </Td>
                  </TableRow>
                ))}
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
