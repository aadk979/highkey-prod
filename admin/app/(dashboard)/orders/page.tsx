"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Select } from "@/components/ui/select";
import { ordersApi } from "@/lib/api/orders";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { formatCents, formatDate, formatLabel } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/lib/types/order";

export default function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [email, setEmail] = useState("");

  const fetcher = useCallback(
    (params: { page: number; limit: number }) =>
      ordersApi.list({
        ...params,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        email: email || undefined,
      }),
    [status, paymentStatus, email],
  );

  const { data, pagination, setPage, loading, error } = usePaginatedFetch(
    fetcher,
    [status, paymentStatus, email],
  );

  return (
    <AppShell title="Orders">
      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Customer email"
            placeholder="Search by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select
            label="Order status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
          >
            <option value="">All</option>
            <option value="received">Received</option>
            <option value="preparing">Preparing</option>
            <option value="shipped_out">Shipped out</option>
            <option value="delivered">Delivered</option>
            <option value="collection_scheduled">Collection scheduled</option>
            <option value="collected">Collected</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select
            label="Payment status"
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value as PaymentStatus | "")
            }
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="disputed">Disputed</option>
          </Select>
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-sm text-error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState
            title="No orders"
            description="Orders will appear here."
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {/* ── existing columns ── */}
                  <Th>#</Th>
                  <Th>Customer</Th>
                  <Th>Total</Th>
                  <Th>Order</Th>
                  <Th>Payment</Th>
                  <Th>Date</Th>
                  {/* ── new columns ── */}
                  <Th>ID</Th>
                  <Th>Public Token</Th>
                  <Th>Country</Th>
                  <Th>Phone</Th>
                  <Th>Fulfillment</Th>
                  <Th>Delivery Address</Th>
                  <Th>Collection Loc ID</Th>
                  <Th>Subtotal</Th>
                  <Th>Discount</Th>
                  <Th>Tax</Th>
                  <Th>Shipping</Th>
                  <Th>Refunded</Th>
                  <Th>Currency</Th>
                  <Th>Promotion ID</Th>
                  <Th>Customization</Th>
                  <Th>Customer Note</Th>
                  <Th>Paid At</Th>
                  <Th>Cancelled At</Th>
                  <Th>Refunded At</Th>
                  <Th>Dispute Reason</Th>
                  <Th>Dispute Status</Th>
                  <Th>Dispute Due By</Th>
                  <Th>Disputed At</Th>
                  <Th>Dispute Resolved</Th>
                  <Th>Updated At</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    {/* ── existing cells ── */}
                    <Td className="font-medium text-ink">
                      #{order.orderNumber}
                    </Td>
                    <Td>
                      <div className="text-ink">{order.customerName}</div>
                      <div className="text-xs text-ink-subtle">
                        {order.customerEmail}
                      </div>
                    </Td>
                    <Td>
                      {formatCents(order.grandTotalCents, order.currencyCode)}
                    </Td>
                    <Td>
                      <OrderStatusBadge status={order.orderStatus} />
                    </Td>
                    <Td>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </Td>
                    <Td>{formatDate(order.createdAt)}</Td>

                    {/* ── new cells ── */}
                    <Td>
                      <span className="font-mono text-xs">
                        {order.id.slice(0, 8)}&hellip;
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs">
                        {order.publicToken}
                      </span>
                    </Td>
                    <Td>{order.countryCode}</Td>
                    <Td>{order.customerPhone}</Td>
                    <Td>{formatLabel(order.fulfillmentMethod)}</Td>
                    <Td>{order.deliveryAddress ?? "null"}</Td>
                    <Td>
                      <span className="font-mono text-xs">
                        {order.collectionLocationId ?? "null"}
                      </span>
                    </Td>
                    <Td>
                      {formatCents(order.subtotalCents, order.currencyCode)}
                    </Td>
                    <Td>
                      {formatCents(
                        order.discountTotalCents,
                        order.currencyCode,
                      )}
                    </Td>
                    <Td>
                      {formatCents(order.taxTotalCents, order.currencyCode)}
                    </Td>
                    <Td>
                      {formatCents(
                        order.shippingTotalCents,
                        order.currencyCode,
                      )}
                    </Td>
                    <Td>
                      {formatCents(
                        order.refundedAmountCents,
                        order.currencyCode,
                      )}
                    </Td>
                    <Td>{order.currencyCode}</Td>
                    <Td>
                      <span className="font-mono text-xs">
                        {order.promotionId ?? "null"}
                      </span>
                    </Td>
                    <Td>{order.customizationMeta ? "Yes" : "null"}</Td>
                    <Td>{order.customerNote ?? "null"}</Td>
                    <Td>{formatDate(order.paidAt)}</Td>
                    <Td>{formatDate(order.cancelledAt)}</Td>
                    <Td>{formatDate(order.refundedAt)}</Td>
                    <Td>{order.disputeReason ?? "null"}</Td>
                    <Td>{order.disputeStatus ?? "null"}</Td>
                    <Td>{formatDate(order.disputeDueBy)}</Td>
                    <Td>{formatDate(order.disputedAt)}</Td>
                    <Td>{formatDate(order.disputeResolvedAt)}</Td>
                    <Td>{formatDate(order.updatedAt)}</Td>
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
