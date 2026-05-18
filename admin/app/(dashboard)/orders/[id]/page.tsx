"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JsonViewer } from "@/components/ui/json-viewer";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  Td,
  Th,
} from "@/components/ui/table";
import { ordersApi } from "@/lib/api/orders";
import { productsApi } from "@/lib/api/products";
import { formatCents, formatDate, formatLabel } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types/order";

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  received: ["preparing"],
  preparing: ["shipped_out", "collection_scheduled"],
  shipped_out: ["delivered"],
  collection_scheduled: ["collected"],
};

const STATUS_CONFIG: Partial<
  Record<
    OrderStatus,
    {
      label: string;
      icon: any;
      variant?: "primary" | "secondary" | "tertiary";
    }
  >
> = {
  preparing: { label: "Start preparing", icon: Package, variant: "primary" },
  shipped_out: { label: "Mark as shipped", icon: Truck, variant: "primary" },
  collection_scheduled: {
    label: "Schedule collection",
    icon: Calendar,
    variant: "secondary",
  },
  delivered: {
    label: "Mark as delivered",
    icon: CheckCircle,
    variant: "primary",
  },
  collected: {
    label: "Mark as collected",
    icon: CheckCircle,
    variant: "primary",
  },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isSuperAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState(false);
  const [refundFull, setRefundFull] = useState(true);
  const [refundAmount, setRefundAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(
    null,
  );
  const [paymentLinkData, setPaymentLinkData] = useState<{
    orderId: string;
    orderNumber: number;
    paymentId: string;
    checkoutUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customisationUrls, setCustomisationUrls] = useState<
    Record<string, string>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrder(await ordersApi.get(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (
      order &&
      order.customizationMeta &&
      (order.customizationMeta as Record<string, any>).is_customised &&
      order.items
    ) {
      // Find all accessory products in order items
      const accessoryProducts = order.items
        .map((item) => item.product)
        .filter(
          (prod): prod is NonNullable<typeof prod> =>
            !!prod && prod.productType === "accessory",
        );

      // Fetch customisation templates for each accessory product to get the resolved URLs
      const templateUrls: Record<string, string> = {};
      Promise.all(
        accessoryProducts.map(async (prod) => {
          if (
            prod.customisationImageIds &&
            prod.customisationImageIds.length > 0
          ) {
            try {
              const res = await productsApi.getCustomisationTemplates(prod.id);
              const templateImg = res.images.find(
                (img) => img.id === prod.customisationImageIds?.[0],
              );
              if (templateImg) {
                templateUrls[prod.id] = templateImg.url;
              }
            } catch (e) {
              // Ignore errors
            }
          }
        }),
      ).then(() => {
        setCustomisationUrls((prev) => ({ ...prev, ...templateUrls }));
      });
    }
  }, [order]);

  const allowedStatuses = order ? (NEXT_STATUSES[order.orderStatus] ?? []) : [];

  async function updateStatus(targetStatus: OrderStatus) {
    if (
      !confirm(
        `Are you sure you want to update the status to ${formatLabel(targetStatus)}?`,
      )
    )
      return;
    setUpdatingStatus(targetStatus);
    try {
      const updated = await ordersApi.updateStatus(id, targetStatus);
      setOrder((o) => (o ? { ...o, ...updated } : updated));
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function cancelOrder() {
    if (!confirm("Cancel this order?")) return;
    setActionLoading(true);
    try {
      const updated = await ordersApi.cancel(id);
      setOrder((o) => (o ? { ...o, ...updated } : updated));
    } finally {
      setActionLoading(false);
    }
  }

  async function createRefund() {
    setActionLoading(true);
    try {
      await ordersApi.refund(
        id,
        refundFull
          ? { full: true }
          : { amountCents: Math.round(parseFloat(refundAmount) * 100) },
      );
      setRefundModal(false);
      await load();
    } finally {
      setActionLoading(false);
    }
  }

  async function generatePaymentLink() {
    setActionLoading(true);
    try {
      const res = await ordersApi.paymentLink(id);
      setPaymentLinkData(res);
      setCopied(false);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!order) {
    return (
      <AppShell title="Order">
        <p className="text-ink-subtle">Order not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Order #${order.orderNumber}`}>
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-subtle hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

      {/* ── Action buttons ── */}
      <div className="mb-6 flex flex-wrap gap-3">
        {allowedStatuses.map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config?.icon;
          return (
            <Button
              key={status}
              variant={config?.variant || "primary"}
              onClick={() => updateStatus(status)}
              loading={updatingStatus === status}
              disabled={updatingStatus !== null && updatingStatus !== status}
            >
              {Icon && <Icon className="mr-2 size-4" />}
              {config?.label || formatLabel(status)}
            </Button>
          );
        })}
        {order.orderStatus !== "cancelled" ? (
          <Button
            variant="danger"
            onClick={cancelOrder}
            loading={actionLoading}
          >
            Cancel order
          </Button>
        ) : null}
        {order.paymentStatus === "pending" ? (
          <Button
            variant="secondary"
            onClick={generatePaymentLink}
            loading={actionLoading}
          >
            Payment link
          </Button>
        ) : null}
        {isSuperAdmin && order.paymentStatus === "paid" ? (
          <Button variant="secondary" onClick={() => setRefundModal(true)}>
            Refund
          </Button>
        ) : null}
        {order.customizationMeta &&
        (order.customizationMeta as Record<string, any>).is_customised ? (
          <Button
            variant="secondary"
            onClick={() => setShowCustomizationModal(true)}
          >
            <Sparkles className="mr-2 size-4 fill-amber-500/20 text-amber-500" />
            View Customization Design
          </Button>
        ) : null}
      </div>

      {/* ── Customer + Summary cards ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader title="Customer" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Name</dt>
              <dd className="text-ink">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Email</dt>
              <dd className="text-ink">{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Phone</dt>
              <dd className="text-ink">{order.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Fulfillment</dt>
              <dd className="capitalize text-ink">
                {formatLabel(order.fulfillmentMethod)}
              </dd>
            </div>
            {/* ── new fields ── */}
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-subtle">ID</dt>
              <dd className="break-all font-mono text-xs text-ink">
                {order.id}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-subtle">Public Token</dt>
              <dd className="break-all font-mono text-xs text-ink">
                {order.publicToken}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Country</dt>
              <dd className="text-ink">{order.countryCode}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-subtle">Delivery Address</dt>
              <dd className="text-right text-ink">
                {order.deliveryAddress ?? "null"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-subtle">Collection Loc ID</dt>
              <dd className="font-mono text-xs text-ink">
                {order.collectionLocationId ?? "null"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-subtle">Customer Note</dt>
              <dd className="text-right text-ink">
                {order.customerNote ?? "null"}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader
            title="Summary"
            action={
              <div className="flex gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            }
          />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Subtotal</dt>
              <dd>{formatCents(order.subtotalCents, order.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Discount</dt>
              <dd>
                {formatCents(order.discountTotalCents, order.currencyCode)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Shipping</dt>
              <dd>
                {formatCents(order.shippingTotalCents, order.currencyCode)}
              </dd>
            </div>
            <div className="flex justify-between font-semibold text-ink">
              <dt>Total</dt>
              <dd>{formatCents(order.grandTotalCents, order.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Created</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            {/* ── new fields ── */}
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Tax</dt>
              <dd>{formatCents(order.taxTotalCents, order.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Refunded</dt>
              <dd>
                {formatCents(order.refundedAmountCents, order.currencyCode)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-subtle">Promotion ID</dt>
              <dd className="font-mono text-xs">
                {order.promotionId ?? "null"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Paid At</dt>
              <dd>{formatDate(order.paidAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Cancelled At</dt>
              <dd>{formatDate(order.cancelledAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Refunded At</dt>
              <dd>{formatDate(order.refundedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Updated At</dt>
              <dd>{formatDate(order.updatedAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* ── Dispute Info card ── */}
      <Card className="mt-6">
        <CardHeader title="Dispute Info" />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-subtle">Dispute Reason</dt>
            <dd>{order.disputeReason ?? "null"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-subtle">Dispute Status</dt>
            <dd>{order.disputeStatus ?? "null"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-subtle">Due By</dt>
            <dd>{formatDate(order.disputeDueBy)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-subtle">Disputed At</dt>
            <dd>{formatDate(order.disputedAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-subtle">Resolved At</dt>
            <dd>{formatDate(order.disputeResolvedAt)}</dd>
          </div>
        </dl>
      </Card>

      {/* ── Collection Location + Promotion cards ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Collection Location */}
        <Card>
          <CardHeader title="Collection Location" />
          {order.collectionLocation ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-subtle">ID</dt>
                <dd className="break-all font-mono text-xs">
                  {order.collectionLocation.id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Name</dt>
                <dd>{order.collectionLocation.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-subtle">Address</dt>
                <dd className="text-right">
                  {order.collectionLocation.address}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Postal Code</dt>
                <dd>{order.collectionLocation.postalCode ?? "null"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-subtle">Instructions</dt>
                <dd className="text-right">
                  {order.collectionLocation.instructions ?? "null"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Active</dt>
                <dd>{String(order.collectionLocation.isActive)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Created At</dt>
                <dd>{formatDate(order.collectionLocation.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Updated At</dt>
                <dd>{formatDate(order.collectionLocation.updatedAt)}</dd>
              </div>
            </dl>
          ) : (
            <dl className="space-y-2 text-sm">
              {(
                [
                  "id",
                  "name",
                  "address",
                  "postalCode",
                  "instructions",
                  "isActive",
                  "createdAt",
                  "updatedAt",
                ] as const
              ).map((f) => (
                <div key={f} className="flex justify-between">
                  <dt className="text-ink-subtle">{f}</dt>
                  <dd className="italic text-ink-muted">null</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        {/* Promotion */}
        <Card>
          <CardHeader title="Promotion" />
          {order.promotion ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-subtle">ID</dt>
                <dd className="break-all font-mono text-xs">
                  {order.promotion.id}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-subtle">Product ID</dt>
                <dd className="font-mono text-xs">
                  {order.promotion.productId ?? "null"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Store Wide</dt>
                <dd>{String(order.promotion.storeWide)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Discount %</dt>
                <dd>
                  {order.promotion.discountPercentage != null
                    ? `${order.promotion.discountPercentage}%`
                    : "null"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Discount Value</dt>
                <dd>
                  {order.promotion.discountValueCents != null
                    ? formatCents(
                        order.promotion.discountValueCents,
                        order.currencyCode,
                      )
                    : "null"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Start Date</dt>
                <dd>{formatDate(order.promotion.startDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">End Date</dt>
                <dd>{formatDate(order.promotion.endDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Track by Phone</dt>
                <dd>{String(order.promotion.trackByPhone)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Usage Limit</dt>
                <dd>
                  {order.promotion.usageLimit != null
                    ? String(order.promotion.usageLimit)
                    : "null"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Active</dt>
                <dd>{String(order.promotion.isActive)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Created At</dt>
                <dd>{formatDate(order.promotion.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-subtle">Updated At</dt>
                <dd>{formatDate(order.promotion.updatedAt)}</dd>
              </div>
            </dl>
          ) : (
            <dl className="space-y-2 text-sm">
              {(
                [
                  "id",
                  "productId",
                  "storeWide",
                  "discountPercentage",
                  "discountValueCents",
                  "startDate",
                  "endDate",
                  "trackByPhone",
                  "usageLimit",
                  "isActive",
                  "createdAt",
                  "updatedAt",
                ] as const
              ).map((f) => (
                <div key={f} className="flex justify-between">
                  <dt className="text-ink-subtle">{f}</dt>
                  <dd className="italic text-ink-muted">null</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </div>

      {/* ── Line items table ── */}
      {order.items && order.items.length > 0 ? (
        <Card className="mt-6 p-0">
          <div className="p-6 pb-0">
            <CardHeader title="Line items" />
          </div>
          <Table>
            <TableHead>
              <TableRow>
                {/* existing */}
                <Th>Product</Th>
                <Th>Qty</Th>
                <Th>Unit</Th>
                <Th>Total</Th>
                {/* new */}
                <Th>Item ID</Th>
                <Th>Order ID</Th>
                <Th>Product ID</Th>
                <Th>Promo ID</Th>
                <Th>Slug</Th>
                <Th>Discount</Th>
                <Th>Item Created</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  {/* existing */}
                  <Td className="text-ink">{item.snapshotName}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>
                    {formatCents(item.unitPriceCents, order.currencyCode)}
                  </Td>
                  <Td>
                    {formatCents(item.lineTotalCents, order.currencyCode)}
                  </Td>
                  {/* new */}
                  <Td>
                    <span className="font-mono text-xs">{item.id}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">{item.orderId}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">
                      {item.productId ?? "null"}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">
                      {item.appliedPromotionId ?? "null"}
                    </span>
                  </Td>
                  <Td>{item.snapshotSlug}</Td>
                  <Td>{formatCents(item.discountCents, order.currencyCode)}</Td>
                  <Td>{formatDate(item.createdAt)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {/* ── Payments section ── */}
      {order.payments && order.payments.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Payments
          </h2>
          {order.payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader title={`Payment · ${payment.id.slice(0, 8)}\u2026`} />

              {/* Payment scalar fields */}
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-subtle">ID</dt>
                  <dd className="break-all font-mono text-xs">{payment.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-subtle">Order ID</dt>
                  <dd className="break-all font-mono text-xs">
                    {payment.orderId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Provider</dt>
                  <dd>{payment.provider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Mode</dt>
                  <dd>{payment.mode}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-subtle">
                    Stripe Checkout Session ID
                  </dt>
                  <dd className="break-all font-mono text-xs">
                    {payment.stripeCheckoutSessionId ?? "null"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-subtle">
                    Stripe Payment Intent ID
                  </dt>
                  <dd className="break-all font-mono text-xs">
                    {payment.stripePaymentIntentId ?? "null"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-subtle">Stripe Charge ID</dt>
                  <dd className="break-all font-mono text-xs">
                    {payment.stripeChargeId ?? "null"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Status</dt>
                  <dd>{payment.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Amount</dt>
                  <dd>
                    {formatCents(payment.amountCents, payment.currencyCode)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Amount Received</dt>
                  <dd>
                    {formatCents(
                      payment.amountReceivedCents,
                      payment.currencyCode,
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Amount Refunded</dt>
                  <dd>
                    {formatCents(
                      payment.amountRefundedCents,
                      payment.currencyCode,
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Currency</dt>
                  <dd>{payment.currencyCode}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-subtle">
                    Stripe Customer ID
                  </dt>
                  <dd className="font-mono text-xs">
                    {payment.stripeCustomerId ?? "null"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Checkout Completed At</dt>
                  <dd>{formatDate(payment.checkoutCompletedAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Paid At</dt>
                  <dd>{formatDate(payment.paidAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Cancelled At</dt>
                  <dd>{formatDate(payment.cancelledAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Failed At</dt>
                  <dd>{formatDate(payment.failedAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Created At</dt>
                  <dd>{formatDate(payment.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-subtle">Updated At</dt>
                  <dd>{formatDate(payment.updatedAt)}</dd>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <dt className="text-ink-subtle">Raw Last Payload</dt>
                  <dd>
                    <JsonViewer value={payment.rawLastPayload} />
                  </dd>
                </div>
              </dl>

              {/* Refunds nested table */}
              {payment.refunds && payment.refunds.length > 0 ? (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-ink">
                    Refunds
                  </h3>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <Th>ID</Th>
                        <Th>Payment ID</Th>
                        <Th>Order ID</Th>
                        <Th>Stripe Refund ID</Th>
                        <Th>Amount</Th>
                        <Th>Currency</Th>
                        <Th>Status</Th>
                        <Th>Reason</Th>
                        <Th>Failure Reason</Th>
                        <Th>Refunded At</Th>
                        <Th>Created At</Th>
                        <Th>Updated At</Th>
                        <Th>Raw Payload</Th>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payment.refunds.map((refund) => (
                        <TableRow key={refund.id}>
                          <Td>
                            <span className="font-mono text-xs">
                              {refund.id}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono text-xs">
                              {refund.paymentId}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono text-xs">
                              {refund.orderId}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono text-xs">
                              {refund.stripeRefundId}
                            </span>
                          </Td>
                          <Td>
                            {formatCents(
                              refund.amountCents,
                              refund.currencyCode,
                            )}
                          </Td>
                          <Td>{refund.currencyCode}</Td>
                          <Td>{refund.status}</Td>
                          <Td>{refund.reason ?? "null"}</Td>
                          <Td>{refund.failureReason ?? "null"}</Td>
                          <Td>{formatDate(refund.refundedAt)}</Td>
                          <Td>{formatDate(refund.createdAt)}</Td>
                          <Td>{formatDate(refund.updatedAt)}</Td>
                          <Td>
                            <JsonViewer value={refund.rawPayload} />
                          </Td>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {/* Disputes nested table */}
              {payment.disputes && payment.disputes.length > 0 ? (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-ink">
                    Disputes
                  </h3>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <Th>ID</Th>
                        <Th>Payment ID</Th>
                        <Th>Order ID</Th>
                        <Th>Stripe Dispute ID</Th>
                        <Th>Amount</Th>
                        <Th>Currency</Th>
                        <Th>Reason</Th>
                        <Th>Status</Th>
                        <Th>Due By</Th>
                        <Th>Evidence Submitted At</Th>
                        <Th>Won At</Th>
                        <Th>Lost At</Th>
                        <Th>Created At</Th>
                        <Th>Updated At</Th>
                        <Th>Raw Payload</Th>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payment.disputes.map((dispute) => (
                        <TableRow key={dispute.id}>
                          <Td>
                            <span className="font-mono text-xs">
                              {dispute.id}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono text-xs">
                              {dispute.paymentId}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono text-xs">
                              {dispute.orderId}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono text-xs">
                              {dispute.stripeDisputeId}
                            </span>
                          </Td>
                          <Td>
                            {formatCents(
                              dispute.amountCents,
                              dispute.currencyCode,
                            )}
                          </Td>
                          <Td>{dispute.currencyCode}</Td>
                          <Td>{dispute.reason ?? "null"}</Td>
                          <Td>{dispute.status}</Td>
                          <Td>{formatDate(dispute.dueBy)}</Td>
                          <Td>{formatDate(dispute.evidenceSubmittedAt)}</Td>
                          <Td>{formatDate(dispute.wonAt)}</Td>
                          <Td>{formatDate(dispute.lostAt)}</Td>
                          <Td>{formatDate(dispute.createdAt)}</Td>
                          <Td>{formatDate(dispute.updatedAt)}</Td>
                          <Td>
                            <JsonViewer value={dispute.rawPayload} />
                          </Td>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {/* ── Refund Modal ── */}
      <Modal
        open={refundModal}
        onClose={() => setRefundModal(false)}
        title="Create refund"
      >
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={refundFull}
            onChange={(e) => setRefundFull(e.target.checked)}
          />
          Full refund
        </label>
        {!refundFull ? (
          <Input
            label="Amount (SGD)"
            type="number"
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
          />
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRefundModal(false)}>
            Cancel
          </Button>
          <Button loading={actionLoading} onClick={createRefund}>
            Process refund
          </Button>
        </div>
      </Modal>

      {/* ── Payment Link Modal ── */}
      <Modal
        open={!!paymentLinkData}
        onClose={() => setPaymentLinkData(null)}
        title="Payment Link Generated"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-subtle">
            A new payment link has been generated for order #
            {paymentLinkData?.orderNumber}. Share this link with the customer to
            collect payment.
          </p>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={paymentLinkData?.checkoutUrl || ""}
              className="flex-1 bg-surface-1 font-mono text-xs"
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (paymentLinkData?.checkoutUrl) {
                  navigator.clipboard.writeText(paymentLinkData.checkoutUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              title="Copy to clipboard"
              className="shrink-0 px-3"
            >
              {copied ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setPaymentLinkData(null)}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                window.open(paymentLinkData?.checkoutUrl, "_blank")
              }
            >
              Open link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Full-Screen Customization Design Visualizer Overlay ── */}
      {showCustomizationModal &&
        (() => {
          const meta = order.customizationMeta as Record<string, any> | null;
          const patches = [];
          if (meta && meta.is_customised && order.items) {
            for (let i = 0; i < 25; i++) {
              const patchId = meta[`patch_${i}_id`];
              if (!patchId) continue;
              const px = Number(meta[`patch_${i}_x`] ?? 0);
              const py = Number(meta[`patch_${i}_y`] ?? 0);
              const prot = Number(meta[`patch_${i}_rot`] ?? 0);

              const matchedItem = order.items.find(
                (item) => item.productId === patchId,
              );
              const matchedProduct = matchedItem?.product;
              const name = matchedItem?.snapshotName ?? "Patch";
              const imageUrl = matchedProduct?.imageIds?.[0] ?? null;

              const w = Math.max(
                1,
                matchedProduct?.dimensions?.maxWidthMm ?? 10,
              );
              const h = Math.max(
                1,
                matchedProduct?.dimensions?.maxHeightMm ?? 10,
              );

              patches.push({
                id: patchId,
                name,
                x: px,
                y: py,
                w,
                h,
                imageUrl,
                rot: prot,
              });
            }
          }

          const canvasW = Number(meta?.canvas_width_mm ?? 50);
          const canvasH = Number(meta?.canvas_height_mm ?? 50);
          const PADDING = 20;
          const vBoxX = -PADDING;
          const vBoxY = -PADDING;
          const vBoxW = canvasW + PADDING * 2;
          const vBoxH = canvasH + PADDING * 2;

          return (
            <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white animate-in fade-in duration-200">
              {/* Top Header */}
              <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#e2ddd8]/60 bg-white/85 px-6 shadow-sm backdrop-blur-lg">
                <div className="flex items-center gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f5f2]">
                    <Sparkles className="h-5 w-5 fill-[#e8132a]/10 text-[#e8132a]" />
                  </div>
                  <div>
                    <h1 className="truncate font-heading text-lg font-bold text-[#0d0d0d]">
                      Order Customization Viewer
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8278]">
                      Order #{order.orderNumber} &middot; {order.customerName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowCustomizationModal(false)}
                  className="rounded-full border border-[#e2ddd8] bg-white px-5 shadow-hover hover:bg-[#f7f5f2]"
                >
                  <X className="mr-2 size-4" />
                  Close Viewer
                </Button>
              </header>

              {/* Main Visualizer Area */}
              <div className="flex flex-1 flex-col overflow-hidden bg-white lg:flex-row">
                {/* SVG Visualizer Canvas */}
                <div
                  className="relative flex flex-1 items-center justify-center overflow-hidden"
                  style={{ backgroundColor: "#f0ece6" }}
                >
                  <div className="flex h-full max-h-[70vh] w-full max-w-lg items-center justify-center">
                    <svg
                      viewBox={`${vBoxX} ${vBoxY} ${vBoxW} ${vBoxH}`}
                      className="h-full w-full touch-none object-contain p-4 md:p-12"
                    >
                      {/* Background Base */}
                      <rect
                        x={0}
                        y={0}
                        width={canvasW}
                        height={canvasH}
                        rx={6}
                        style={{
                          fill: "rgba(255,255,255,0.6)",
                          stroke: "#e8132a",
                          strokeWidth: 0.5,
                          strokeDasharray: "2 2",
                        }}
                      />

                      {/* Dimensions Rulers */}
                      <g style={{ opacity: 0.6, pointerEvents: "none" }}>
                        {/* Top width line */}
                        <line
                          x1={0}
                          y1={-8}
                          x2={canvasW}
                          y2={-8}
                          stroke="#8c8278"
                          strokeWidth={0.5}
                        />
                        <line
                          x1={0}
                          y1={-11}
                          x2={0}
                          y2={-5}
                          stroke="#8c8278"
                          strokeWidth={0.5}
                        />
                        <line
                          x1={canvasW}
                          y1={-11}
                          x2={canvasW}
                          y2={-5}
                          stroke="#8c8278"
                          strokeWidth={0.5}
                        />
                        <text
                          x={canvasW / 2}
                          y={-12}
                          textAnchor="middle"
                          fontSize="6px"
                          fill="#8c8278"
                          fontFamily="monospace"
                        >
                          {canvasW} mm
                        </text>

                        {/* Left height line */}
                        <line
                          x1={-8}
                          y1={0}
                          x2={-8}
                          y2={canvasH}
                          stroke="#8c8278"
                          strokeWidth={0.5}
                        />
                        <line
                          x1={-11}
                          y1={0}
                          x2={-5}
                          y2={0}
                          stroke="#8c8278"
                          strokeWidth={0.5}
                        />
                        <line
                          x1={-11}
                          y1={canvasH}
                          x2={-5}
                          y2={canvasH}
                          stroke="#8c8278"
                          strokeWidth={0.5}
                        />
                        <text
                          x={-12}
                          y={canvasH / 2}
                          fill="#8c8278"
                          fontSize="6px"
                          fontFamily="monospace"
                          textAnchor="middle"
                          transform={`rotate(-90, -12, ${canvasH / 2})`}
                        >
                          {canvasH} mm
                        </text>
                      </g>

                      {/* Render Patches */}
                      {patches.map((patch, idx) => {
                        const customisationImg = customisationUrls[patch.id];
                        const imgHref = customisationImg || patch.imageUrl;

                        return (
                          <g
                            key={`${patch.id}-${idx}`}
                            transform={`rotate(${patch.rot || 0}, ${patch.x}, ${patch.y})`}
                          >
                            {/* Invisible hit area */}
                            <rect
                              x={patch.x - patch.w / 2}
                              y={patch.y - patch.h / 2}
                              width={patch.w}
                              height={patch.h}
                              fill="transparent"
                            />

                            {/* Image or Placeholder */}
                            {imgHref ? (
                              <image
                                href={imgHref}
                                x={patch.x - patch.w / 2}
                                y={patch.y - patch.h / 2}
                                width={patch.w}
                                height={patch.h}
                                preserveAspectRatio="xMidYMid meet"
                              />
                            ) : (
                              <rect
                                x={patch.x - patch.w / 2}
                                y={patch.y - patch.h / 2}
                                width={patch.w}
                                height={patch.h}
                                rx={2}
                                style={{
                                  fill: "#ffffff",
                                  stroke: "#0d0d0d",
                                  strokeWidth: 0.5,
                                }}
                              />
                            )}

                            {/* Highlight Border */}
                            <rect
                              x={patch.x - patch.w / 2}
                              y={patch.y - patch.h / 2}
                              width={patch.w}
                              height={patch.h}
                              rx={2}
                              style={{
                                fill: "transparent",
                                stroke: "rgba(255,255,255,0.4)",
                                strokeWidth: 0.5,
                                strokeDasharray: "1 1",
                              }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Overlay info */}
                  <div className="pointer-events-none absolute right-6 top-6 flex flex-col gap-2">
                    <div className="rounded-2xl border border-[#e2ddd8] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
                      <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[#8c8278]">
                        Dimensions
                      </p>
                      <p className="font-mono text-sm font-semibold text-[#0d0d0d]">
                        {canvasW} x {canvasH} mm
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#e2ddd8] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
                      <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[#8c8278]">
                        Patches Placed
                      </p>
                      <p className="font-mono text-sm font-semibold text-[#0d0d0d]">
                        {patches.length} Placed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patch specifications sidebar */}
                <aside className="shadow-multi flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-[#e2ddd8]/60 bg-[#f7f5f2]/80 p-6 backdrop-blur-xl lg:w-80 lg:border-l lg:border-t-0">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#8c8278]">
                    Design Breakdown
                  </h3>
                  <p className="mb-4 text-xs leading-relaxed text-[#8c8278]">
                    Exact placements and coordinates of each patch accessory for
                    key assembly.
                  </p>

                  <div className="flex flex-col gap-3">
                    {patches.map((patch, idx) => {
                      const customisationImg = customisationUrls[patch.id];
                      const imgHref = customisationImg || patch.imageUrl;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-2xl border border-[#e2ddd8]/80 bg-white p-3 shadow-sm transition-all duration-300 hover:border-[#e8132a]/40"
                        >
                          {imgHref ? (
                            <img
                              src={imgHref}
                              alt={patch.name}
                              className="h-12 w-12 rounded border border-[#e2ddd8] bg-[#f7f5f2] object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded border border-[#e2ddd8] bg-[#f7f5f2]">
                              <Package className="size-5 text-[#8c8278]" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-xs font-bold text-[#0d0d0d]"
                              title={patch.name}
                            >
                              {patch.name}
                            </p>
                            <div className="mt-1 flex w-fit flex-wrap gap-2 rounded-full bg-[#f7f5f2] px-2 py-0.5 text-[10px] font-mono text-[#8c8278]">
                              <span>
                                X: <b>{patch.x}mm</b>
                              </span>
                              <span>
                                Y: <b>{patch.y}mm</b>
                              </span>
                              {patch.rot !== 0 && (
                                <span>
                                  Rot: <b>{patch.rot}&deg;</b>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </aside>
              </div>
            </div>
          );
        })()}
    </AppShell>
  );
}
