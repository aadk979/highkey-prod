"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, Calendar, CheckCircle, Copy, Check, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const STATUS_CONFIG: Partial<Record<OrderStatus, { label: string; icon: any; variant?: "primary" | "secondary" | "tertiary" }>> = {
  preparing: { label: "Start preparing", icon: Package, variant: "primary" },
  shipped_out: { label: "Mark as shipped", icon: Truck, variant: "primary" },
  collection_scheduled: { label: "Schedule collection", icon: Calendar, variant: "secondary" },
  delivered: { label: "Mark as delivered", icon: CheckCircle, variant: "primary" },
  collected: { label: "Mark as collected", icon: CheckCircle, variant: "primary" },
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
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);
  const [paymentLinkData, setPaymentLinkData] = useState<{
    orderId: string;
    orderNumber: number;
    paymentId: string;
    checkoutUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customisationUrls, setCustomisationUrls] = useState<Record<string, string>>({});

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
    if (order && order.customizationMeta && (order.customizationMeta as Record<string, any>).is_customised && order.items) {
      // Find all accessory products in order items
      const accessoryProducts = order.items
        .map(item => item.product)
        .filter((prod): prod is NonNullable<typeof prod> => !!prod && prod.productType === "accessory");

      // Fetch customisation templates for each accessory product to get the resolved URLs
      const templateUrls: Record<string, string> = {};
      Promise.all(
        accessoryProducts.map(async (prod) => {
          if (prod.customisationImageIds && prod.customisationImageIds.length > 0) {
            try {
              const res = await productsApi.getCustomisationTemplates(prod.id);
              const templateImg = res.images.find(img => img.id === prod.customisationImageIds?.[0]);
              if (templateImg) {
                templateUrls[prod.id] = templateImg.url;
              }
            } catch (e) {
              // Ignore errors
            }
          }
        })
      ).then(() => {
        setCustomisationUrls(prev => ({ ...prev, ...templateUrls }));
      });
    }
  }, [order]);

  const allowedStatuses = order
    ? (NEXT_STATUSES[order.orderStatus] ?? [])
    : [];

  async function updateStatus(targetStatus: OrderStatus) {
    if (!confirm(`Are you sure you want to update the status to ${formatLabel(targetStatus)}?`)) return;
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
          <Button variant="danger" onClick={cancelOrder} loading={actionLoading}>
            Cancel order
          </Button>
        ) : null}
        {order.paymentStatus === "pending" ? (
          <Button variant="secondary" onClick={generatePaymentLink} loading={actionLoading}>
            Payment link
          </Button>
        ) : null}
        {isSuperAdmin && order.paymentStatus === "paid" ? (
          <Button variant="secondary" onClick={() => setRefundModal(true)}>
            Refund
          </Button>
        ) : null}
        {order.customizationMeta && (order.customizationMeta as Record<string, any>).is_customised ? (
          <Button variant="secondary" onClick={() => setShowCustomizationModal(true)}>
            <Sparkles className="mr-2 size-4 text-amber-500 fill-amber-500/20" />
            View Customization Design
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
          </dl>
        </Card>

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
              <dd>{formatCents(order.discountTotalCents, order.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Shipping</dt>
              <dd>{formatCents(order.shippingTotalCents, order.currencyCode)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-ink">
              <dt>Total</dt>
              <dd>{formatCents(order.grandTotalCents, order.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">Created</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {order.items && order.items.length > 0 ? (
        <Card className="mt-6 p-0">
          <div className="p-6 pb-0">
            <CardHeader title="Line items" />
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Product</Th>
                <Th>Qty</Th>
                <Th>Unit</Th>
                <Th>Total</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <Td className="text-ink">{item.snapshotName}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatCents(item.unitPriceCents, order.currencyCode)}</Td>
                  <Td>{formatCents(item.lineTotalCents, order.currencyCode)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}



      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Create refund">
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

      <Modal open={!!paymentLinkData} onClose={() => setPaymentLinkData(null)} title="Payment Link Generated">
        <div className="space-y-4">
          <p className="text-sm text-ink-subtle">
            A new payment link has been generated for order #{paymentLinkData?.orderNumber}. Share this link with the customer to collect payment.
          </p>
          <div className="flex gap-2 items-center">
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
              className="px-3 shrink-0"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPaymentLinkData(null)}>
              Close
            </Button>
            <Button onClick={() => window.open(paymentLinkData?.checkoutUrl, "_blank")}>
              Open link
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full-Screen Customization Design Visualizer Overlay */}
      {showCustomizationModal && (() => {
        const meta = order.customizationMeta as Record<string, any> | null;
        const patches = [];
        if (meta && meta.is_customised && order.items) {
          for (let i = 0; i < 25; i++) {
            const patchId = meta[`patch_${i}_id`];
            if (!patchId) continue;
            const px = Number(meta[`patch_${i}_x`] ?? 0);
            const py = Number(meta[`patch_${i}_y`] ?? 0);
            const prot = Number(meta[`patch_${i}_rot`] ?? 0);
            
            const matchedItem = order.items.find(item => item.productId === patchId);
            const matchedProduct = matchedItem?.product;
            const name = matchedItem?.snapshotName ?? "Patch";
            const imageUrl = matchedProduct?.imageIds?.[0] ?? null;
            
            const w = Math.max(1, matchedProduct?.dimensions?.maxWidthMm ?? 10);
            const h = Math.max(1, matchedProduct?.dimensions?.maxHeightMm ?? 10);
            
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
          <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
            {/* Top Header */}
            <header className="relative z-50 h-16 shrink-0 border-b border-[#e2ddd8]/60 bg-white/85 backdrop-blur-lg flex items-center px-6 justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f7f5f2]">
                  <Sparkles className="w-5 h-5 text-[#e8132a] fill-[#e8132a]/10" />
                </div>
                <div>
                  <h1 className="font-heading text-lg font-bold truncate text-[#0d0d0d]">Order Customization Viewer</h1>
                  <p className="text-[10px] uppercase tracking-widest text-[#8c8278] font-bold">
                    Order #{order.orderNumber} · {order.customerName}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowCustomizationModal(false)}
                className="rounded-full shadow-hover px-5 border border-[#e2ddd8] bg-white hover:bg-[#f7f5f2]"
              >
                <X className="mr-2 size-4" />
                Close Viewer
              </Button>
            </header>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
              
              {/* SVG Visualizer Canvas */}
              <div 
                className="flex-1 relative overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: "#f0ece6" }}
              >
                <div className="w-full h-full max-w-lg max-h-[70vh] flex items-center justify-center">
                  <svg
                    viewBox={`${vBoxX} ${vBoxY} ${vBoxW} ${vBoxH}`}
                    className="w-full h-full object-contain p-4 md:p-12 touch-none"
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
                      <line x1={0} y1={-8} x2={canvasW} y2={-8} stroke="#8c8278" strokeWidth={0.5} />
                      <line x1={0} y1={-11} x2={0} y2={-5} stroke="#8c8278" strokeWidth={0.5} />
                      <line x1={canvasW} y1={-11} x2={canvasW} y2={-5} stroke="#8c8278" strokeWidth={0.5} />
                      <text x={canvasW / 2} y={-12} textAnchor="middle" fontSize="6px" fill="#8c8278" fontFamily="monospace">
                        {canvasW} mm
                      </text>

                      {/* Left height line */}
                      <line x1={-8} y1={0} x2={-8} y2={canvasH} stroke="#8c8278" strokeWidth={0.5} />
                      <line x1={-11} y1={0} x2={-5} y2={0} stroke="#8c8278" strokeWidth={0.5} />
                      <line x1={-11} y1={canvasH} x2={-5} y2={canvasH} stroke="#8c8278" strokeWidth={0.5} />
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
                              style={{ fill: "#ffffff", stroke: "#0d0d0d", strokeWidth: 0.5 }}
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
                <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#e2ddd8] shadow-sm">
                    <p className="text-xs font-bold uppercase text-[#8c8278] tracking-wider mb-0.5">Dimensions</p>
                    <p className="text-sm font-mono font-semibold text-[#0d0d0d]">{canvasW} x {canvasH} mm</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#e2ddd8] shadow-sm">
                    <p className="text-xs font-bold uppercase text-[#8c8278] tracking-wider mb-0.5">Patches Placed</p>
                    <p className="text-sm font-mono font-semibold text-[#0d0d0d]">{patches.length} Placed</p>
                  </div>
                </div>
              </div>

              {/* Patch specifications sidebar */}
              <aside className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-[#e2ddd8]/60 bg-[#f7f5f2]/80 backdrop-blur-xl p-6 overflow-y-auto shadow-multi flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8c8278] mb-1">
                  Design Breakdown
                </h3>
                <p className="text-xs text-[#8c8278] leading-relaxed mb-4">
                  Exact placements and coordinates of each patch accessory for key assembly.
                </p>

                <div className="flex flex-col gap-3">
                  {patches.map((patch, idx) => {
                    const customisationImg = customisationUrls[patch.id];
                    const imgHref = customisationImg || patch.imageUrl;

                    return (
                      <div 
                        key={idx} 
                        className="p-3 bg-white rounded-2xl border border-[#e2ddd8]/80 flex items-center gap-3 shadow-sm hover:border-[#e8132a]/40 transition-all duration-300"
                      >
                        {imgHref ? (
                          <img
                            src={imgHref}
                            alt={patch.name}
                            className="w-12 h-12 object-contain rounded bg-[#f7f5f2] p-1 border border-[#e2ddd8]"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-[#f7f5f2] rounded border border-[#e2ddd8]">
                            <Package className="size-5 text-[#8c8278]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0d0d0d] truncate" title={patch.name}>
                            {patch.name}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[#8c8278] mt-1 bg-[#f7f5f2] py-0.5 px-2 rounded-full w-fit">
                            <span>X: <b>{patch.x}mm</b></span>
                            <span>Y: <b>{patch.y}mm</b></span>
                            {patch.rot !== 0 && <span>Rot: <b>{patch.rot}°</b></span>}
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
