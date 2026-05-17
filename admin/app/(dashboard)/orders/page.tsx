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
import { formatCents, formatDate } from "@/lib/utils";
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
          <EmptyState title="No orders" description="Orders will appear here." />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>#</Th>
                  <Th>Customer</Th>
                  <Th>Total</Th>
                  <Th>Order</Th>
                  <Th>Payment</Th>
                  <Th>Date</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <Td className="font-medium text-ink">#{order.orderNumber}</Td>
                    <Td>
                      <div className="text-ink">{order.customerName}</div>
                      <div className="text-xs text-ink-subtle">{order.customerEmail}</div>
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
