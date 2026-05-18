"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Copy,
  Check,
  Package,
  CreditCard,
  StickyNote,
  Tag,
  AlertTriangle,
  Calendar,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { Order, Product } from "@/lib/types/storefront";
import {
  BADGE_STYLES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatOrderDate,
  fulfillmentLabel,
  getStatusSteps,
  orderStatusTone,
  paymentStatusTone,
  stepIndexForStatus,
} from "@/lib/order/display";
import { getProduct } from "@/lib/api/storefront";

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof BADGE_STYLES;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${BADGE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="border border-border rounded-xl bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={16} />
        </div>
        <h2 className="font-heading text-lg font-medium text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

function StatusTimeline({ order }: { order: Order }) {
  const steps = getStatusSteps(order.fulfillmentMethod);
  const currentIdx = stepIndexForStatus(order.orderStatus, steps);
  const isTerminal =
    order.orderStatus === "cancelled" ||
    order.orderStatus === "refunded" ||
    order.orderStatus === "disputed";

  if (isTerminal) {
    return (
      <div className="rounded-lg border border-border bg-surface/80 px-4 py-3 text-sm text-muted">
        This order is{" "}
        <span className="font-medium text-foreground">
          {ORDER_STATUS_LABELS[order.orderStatus].toLowerCase()}
        </span>
        .
        {order.cancelledAt && (
          <span className="block mt-1 text-xs">
            {formatOrderDate(order.cancelledAt)}
          </span>
        )}
        {order.refundedAt && (
          <span className="block mt-1 text-xs">
            Refunded {formatOrderDate(order.refundedAt)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center w-full">
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex sm:flex-1 items-center gap-2 sm:flex-col sm:gap-2 min-w-0 shrink-0">
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.05 : 1,
                backgroundColor: done ? "var(--color-primary)" : "var(--color-border)",
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? "text-white" : "text-muted bg-surface"
              }`}
            >
              {i + 1}
            </motion.div>
            <span
              className={`text-xs font-medium sm:text-center ${
                active ? "text-primary" : done ? "text-foreground" : "text-muted"
              }`}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <motion.div
                className="hidden sm:block flex-1 h-px mx-2 bg-border self-center mt-[-1.25rem]"
                style={{
                  background: i < currentIdx ? "var(--color-primary)" : undefined,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderLineItem({
  item,
  currencyCode,
  index,
}: {
  item: Order["items"][0];
  currencyCode: string;
  index: number;
}) {
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (item.productId) {
      getProduct(item.productId)
        .then(setLiveProduct)
        .catch(() => {});
    }
  }, [item.productId]);

  const rawImageSrc = liveProduct?.imageIds?.[0] || item.product?.imageIds?.[0];
  const description = liveProduct?.description || item.product?.description;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
      className="flex gap-4 p-4 rounded-xl border border-border/70 bg-surface/50 hover:bg-surface transition-colors"
    >
      <div className="relative w-[88px] h-[88px] shrink-0 rounded-lg border border-border bg-white overflow-hidden flex items-center justify-center">
        {rawImageSrc ? (
          <Image
            src={rawImageSrc}
            alt={item.snapshotName}
            fill
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <Package className="w-8 h-8 text-muted/40" />
        )}
      </div>
      <motion.div layout className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 py-0.5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-heading text-lg font-medium text-foreground truncate">
              {item.snapshotName}
            </h3>
            {item.product?.productType && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                {item.product.productType}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-2">
              {description}
            </p>
          )}
          <p className="text-xs text-muted font-mono">
            Qty {item.quantity} ·{" "}
            {formatMoney(item.unitPriceCents, currencyCode)} each
            {item.discountCents > 0 && (
              <span className="text-green-600 ml-1">
                (−{formatMoney(item.discountCents, currencyCode)} off)
              </span>
            )}
          </p>
        </div>
        <p className="font-medium text-foreground text-lg shrink-0 sm:pt-1">
          {formatMoney(item.lineTotalCents, currencyCode)}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function OrderDetails({ order }: { order: Order }) {
  const [copied, setCopied] = useState(false);

  const copyToken = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(order.publicToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [order.publicToken]);



  return (
    <div className="max-w-[960px] mx-auto">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 p-8 md:p-10 rounded-2xl bg-section border border-border relative overflow-hidden"
      >
        <motion.div
          aria-hidden
          className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
        />
        <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Order confirmation
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
          <div>
            <h1 className="font-heading font-light text-4xl md:text-5xl text-foreground mb-3">
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted flex items-center gap-2 text-sm">
              <Calendar size={14} />
              Placed {formatOrderDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={ORDER_STATUS_LABELS[order.orderStatus]}
              tone={orderStatusTone(order.orderStatus)}
            />
            <StatusBadge
              label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
              tone={paymentStatusTone(order.paymentStatus)}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 pt-8 border-t border-border/60"
        >
          <StatusTimeline order={order} />
        </motion.div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-heading text-xl font-medium mb-4 px-1">
              Your pieces ({order.items.length})
            </h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item, i) => (
                <OrderLineItem
                  key={item.id}
                  item={item}
                  currencyCode={order.currencyCode}
                  index={i}
                />
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard title="Fulfillment" icon={Truck} delay={0.2}>
              <p className="text-sm font-medium text-foreground mb-3">
                {fulfillmentLabel(order.fulfillmentMethod)}
              </p>
              {order.fulfillmentMethod === "delivery" && order.deliveryAddress ? (
                <div className="flex gap-2 text-sm text-muted">
                  <MapPin size={16} className="shrink-0 text-primary mt-0.5" />
                  <p className="whitespace-pre-line leading-relaxed break-words break-all sm:break-normal">
                    {order.deliveryAddress}
                  </p>
                </div>
              ) : order.collectionLocation ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium text-foreground">
                    {order.collectionLocation.name}
                  </p>
                  <p className="text-muted">{order.collectionLocation.address}</p>
                  {order.collectionLocation.postalCode && (
                    <p className="text-muted">
                      {order.collectionLocation.postalCode}
                    </p>
                  )}
                  {order.collectionLocation.instructions && (
                    <p className="text-xs text-muted mt-2 pt-2 border-t border-border italic">
                      {order.collectionLocation.instructions}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">Details pending.</p>
              )}
            </InfoCard>

            <InfoCard title="Contact" icon={User} delay={0.25}>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <User size={16} className="shrink-0 text-primary mt-0.5" />
                  <span className="font-medium text-foreground">
                    {order.customerName}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-muted">
                  <Mail size={16} className="shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="hover:text-primary transition-colors break-all"
                  >
                    {order.customerEmail}
                  </a>
                </li>
                <li className="flex items-start gap-2 text-muted">
                  <Phone size={16} className="shrink-0 mt-0.5" />
                  <span>
                    {order.countryCode} {order.customerPhone}
                  </span>
                </li>
              </ul>
            </InfoCard>
          </div>

          {order.customerNote && (
            <InfoCard title="Your note" icon={StickyNote} delay={0.3}>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {order.customerNote}
              </p>
            </InfoCard>
          )}

          {order.promotion && (
            <InfoCard title="Promotion applied" icon={Tag} delay={0.34}>
              <p className="text-sm text-muted">
                {order.promotion.storeWide ? "Store-wide" : "Product"} promotion
                {order.promotion.discountPercentage != null &&
                  ` · ${order.promotion.discountPercentage}% off`}
                {order.promotion.discountValueCents != null &&
                  ` · ${formatMoney(order.promotion.discountValueCents, order.currencyCode)} off`}
              </p>
            </InfoCard>
          )}

          {(order.disputeStatus || order.disputedAt) && (
            <InfoCard title="Dispute" icon={AlertTriangle} delay={0.36}>
              <motion.div layout className="space-y-2 text-sm">
                {order.disputeStatus && (
                  <p>
                    <span className="text-muted">Status: </span>
                    <span className="font-medium capitalize">
                      {order.disputeStatus.replace(/_/g, " ")}
                    </span>
                  </p>
                )}
                {order.disputeReason && (
                  <p className="text-muted">{order.disputeReason}</p>
                )}
                {order.disputeDueBy && (
                  <p className="text-xs text-muted">
                    Response due {formatOrderDate(order.disputeDueBy)}
                  </p>
                )}
              </motion.div>
            </InfoCard>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="sticky top-28 border border-border rounded-2xl bg-white p-6 shadow-multi"
          >
            <div className="flex items-center gap-2 mb-6">
              <CreditCard size={18} className="text-primary" />
              <h2 className="font-heading text-lg font-medium">Payment summary</h2>
            </div>

            <dl className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium">
                  {formatMoney(order.subtotalCents, order.currencyCode)}
                </dd>
              </div>
              {order.discountTotalCents > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>Discount</dt>
                  <dd className="font-medium">
                    −{formatMoney(order.discountTotalCents, order.currencyCode)}
                  </dd>
                </div>
              )}
              {order.taxTotalCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Tax</dt>
                  <dd className="font-medium">
                    {formatMoney(order.taxTotalCents, order.currencyCode)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-medium">
                  {order.shippingTotalCents > 0
                    ? formatMoney(order.shippingTotalCents, order.currencyCode)
                    : "Free"}
                </dd>
              </div>
              {order.refundedAmountCents > 0 && (
                <motion.div layout className="flex justify-between text-destructive">
                  <dt>Refunded</dt>
                  <dd className="font-medium">
                    −{formatMoney(order.refundedAmountCents, order.currencyCode)}
                  </dd>
                </motion.div>
              )}
            </dl>

            <div className="h-px bg-border mb-4" />
            <div className="flex justify-between items-end mb-6">
              <span className="text-muted font-medium">Total</span>
              <span className="font-heading text-3xl text-primary font-medium leading-none">
                {formatMoney(order.grandTotalCents, order.currencyCode)}
              </span>
            </div>

            <div className="space-y-3 text-xs text-muted border-t border-border pt-4 mb-6">
              {order.paidAt && (
                <p>Paid {formatOrderDate(order.paidAt)}</p>
              )}
              <p>Last updated {formatOrderDate(order.updatedAt)}</p>
            </div>

            <div className="rounded-lg bg-surface border border-border p-3 mb-6">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted mb-2 flex items-center gap-1">
                <Hash size={12} /> Reference
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-foreground truncate flex-1">
                  {order.publicToken}
                </code>
                <button
                  type="button"
                  onClick={copyToken}
                  className="shrink-0 p-2 rounded-md hover:bg-border transition-colors text-muted hover:text-foreground"
                  aria-label="Copy order token"
                >
                  {copied ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            <Link href="/shop" className="block">
              <Button variant="outline" className="w-full rounded-full">
                Continue shopping
              </Button>
            </Link>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
