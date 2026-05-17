"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Tag, X } from "lucide-react";
import { cartEngine, CartItem } from "@/app/utils/cartEngine";
import {
  createCheckoutSession,
  getCheckoutQuote,
  listCollectionLocations,
  listPromotions,
} from "@/lib/api/storefront";
import { formatMoney } from "@/lib/format";
import type {
  CheckoutQuote,
  CollectionLocation,
  FulfillmentMethodSession,
  PublicPromotion,
} from "@/lib/types/storefront";
import { StorefrontApiError } from "@/lib/api/client";

function CheckoutContent() {
  const [locations, setLocations] = useState<CollectionLocation[]>([]);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartEmpty, setCartEmpty] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [promotions, setPromotions] = useState<PublicPromotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [isPromotionsModalOpen, setIsPromotionsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+65");
  const [phone, setPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethodSession>("self_collect");
  const [collectionLocationId, setCollectionLocationId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const fetchQuote = useCallback(async () => {
    setError(null);
    const items = await cartEngine.getAllItems();
    if (items.length === 0) {
      setCartEmpty(true);
      setLoading(false);
      return;
    }

    const customizedBase = items.find((i) => i.customizationMeta);
    const customizationMeta = customizedBase?.customizationMeta as Record<string, string | number | boolean> | undefined;

    try {
      const result = await getCheckoutQuote({
        customer: { name, email, countryCode, phone },
        customerNote,
        fulfillment: {
          method:
            fulfillment === "self_collect"
              ? "self_collect"
              : "delivery",
          collectionLocationId:
            fulfillment === "self_collect" ? collectionLocationId : undefined,
          deliveryAddress:
            fulfillment === "delivery" ? deliveryAddress : undefined,
        },
        items: items.map((i) => ({
          productId: i.product_id,
          quantity: i.quantity,
        })),
        promotionId: selectedPromotionId,
        customizationMeta,
      });
      setQuote(result);
    } catch (err) {
      if (err instanceof StorefrontApiError) {
        setError(err.message);
      } else {
        setError("Could not calculate your order total.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    name,
    email,
    countryCode,
    phone,
    customerNote,
    fulfillment,
    collectionLocationId,
    deliveryAddress,
    selectedPromotionId,
  ]);

  useEffect(() => {
    cartEngine.getAllItems().then((items) => {
      if (items.length === 0) {
        setCartEmpty(true);
        setLoading(false);
      } else {
        setCartItems(items);
      }
    });

    listCollectionLocations()
      .then(setLocations)
      .catch(() => setLocations([]));

    listPromotions({ limit: 100 })
      .then((res) => setPromotions(res.data))
      .catch(() => setPromotions([]));
  }, []);

  const getPromotionDisabledReason = (promo: PublicPromotion): string | null => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    if (now < start || now > end) {
      return "Not currently active";
    }

    if (!promo.storeWide && promo.productId) {
      const hasProduct = cartItems.some(i => i.product_id === promo.productId);
      if (!hasProduct) {
        return "Required product not in cart";
      }
    }

    return null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (name && email && phone) fetchQuote();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchQuote, name, email, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const items = await cartEngine.getAllItems();
    const customizedBase = items.find((i) => i.customizationMeta);
    const customizationMeta = customizedBase?.customizationMeta as Record<string, string | number | boolean> | undefined;

    try {
      const session = await createCheckoutSession({
        items: items.map((i) => ({
          productId: i.product_id,
          quantity: i.quantity,
        })),
        customer: { name, email, countryCode, phone },
        customerNote: customerNote || null,
        promotionId: selectedPromotionId,
        fulfillment: {
          method: fulfillment,
          collectionLocationId:
            fulfillment === "self_collect" ? collectionLocationId : null,
          deliveryAddress:
            fulfillment === "delivery" ? deliveryAddress : null,
        },
        customizationMeta,
      });
      window.location.href = session.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof StorefrontApiError
          ? err.message
          : "Checkout could not be started. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (cartEmpty) {
    return (
      <div className="flex-1 pt-32 pb-24 px-6 text-center">
        <p className="text-muted mb-6">Your cart is empty.</p>
        <Link href="/shop">
          <Button className="rounded-full">Browse Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-background pt-32 pb-24 px-6"
    >
      <motion.div layout className="max-w-[960px] mx-auto">
        <Link
          href="/cart"
          className="inline-flex items-center text-sm text-muted hover:text-primary mb-8"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to cart
        </Link>

        <h1 className="font-heading font-light text-4xl md:text-5xl mb-10">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12"
        >
          <div className="lg:col-span-3 flex flex-col gap-6">
            <section className="p-6 border border-border rounded-xl bg-surface">
              <h2 className="font-heading text-xl mb-4">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
                />
                <input
                  required
                  placeholder="Country code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
                />
                <input
                  required
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </section>

            <section className="p-6 border border-border rounded-xl bg-surface">
              <h2 className="font-heading text-xl mb-4">Fulfillment</h2>
              <motion.div layout className="flex flex-wrap gap-2 mb-4">
                {(
                  [
                    ["self_collect", "Self collect"],
                    ["delivery", "Delivery"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFulfillment(value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      fulfillment === value
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>

              {fulfillment === "self_collect" && (
                <select
                  required
                  value={collectionLocationId}
                  onChange={(e) => setCollectionLocationId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">Select collection point</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} — {loc.address}
                    </option>
                  ))}
                </select>
              )}

              {fulfillment === "delivery" && (
                <textarea
                  required
                  placeholder="Delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm resize-none"
                />
              )}
            </section>

            <textarea
              placeholder="Order notes (optional)"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-sm resize-none"
            />
          </div>

          <div className="lg:col-span-2">
            <div className="p-6 border border-border rounded-xl bg-surface sticky top-28">
              <h2 className="font-heading text-xl mb-6">Order summary</h2>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : quote ? (
                <div className="flex flex-col gap-3 text-sm mb-6">
                  {quote.items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span className="text-muted truncate pr-4">
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatMoney(item.lineTotalCents, quote.currencyCode)}</span>
                    </div>
                  ))}
                  <div className="h-px bg-border my-2" />

                  {quote.promotion?.applied && quote.discountTotalCents > 0 && (
                    <motion.div layout className="flex justify-between text-green-600">
                      <span>Discount applied</span>
                      <span>-{formatMoney(quote.discountTotalCents, quote.currencyCode)}</span>
                    </motion.div>
                  )}

                  <motion.div layout className="flex justify-between">
                    <span className="text-muted">Shipping</span>
                    <span>{formatMoney(quote.shippingTotalCents, quote.currencyCode)}</span>
                  </motion.div>
                  <div className="flex justify-between font-medium text-lg pt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatMoney(quote.grandTotalCents, quote.currencyCode)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted mb-6">
                  Enter your details to see pricing.
                </p>
              )}

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setIsPromotionsModalOpen(true)}
                  className="w-full py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Tag size={14} />
                  {selectedPromotionId ? "Change Promotion" : "View Promotions"}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-destructive text-sm mb-4 p-3 bg-destructive/5 rounded-lg">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full"
                disabled={submitting || !quote}
              >
                {submitting ? "Redirecting to payment..." : "Pay with Stripe"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>

      {isPromotionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-heading">Available Promotions</h3>
              <button
                onClick={() => setIsPromotionsModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            {promotions.length === 0 ? (
              <p className="text-muted text-sm">No promotions available right now.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {promotions.map((promo) => {
                  const disabledReason = getPromotionDisabledReason(promo);
                  const isDisabled = disabledReason !== null;
                  return (
                    <div
                      key={promo.id}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedPromotionId(promo.id === selectedPromotionId ? null : promo.id);
                        }
                      }}
                      className={`p-4 border rounded-lg transition-colors ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed border-border bg-secondary/10"
                          : promo.id === selectedPromotionId
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-border hover:border-primary/50 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {promo.discountPercentage
                            ? `${promo.discountPercentage}% OFF`
                            : promo.discountValueCents
                            ? `${formatMoney(promo.discountValueCents, "SGD")} OFF`
                            : "Discount"}
                        </span>
                        {promo.id === selectedPromotionId && !isDisabled && (
                          <span className="text-primary text-xs font-bold">Selected</span>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1">
                        {promo.storeWide ? "Store-wide promotion" : `For specific product`}
                      </p>
                      <p className="text-xs text-muted/60 mt-1">
                        Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                      </p>
                      {isDisabled && (
                        <p className="text-xs text-destructive mt-2 font-medium flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive"></span>
                          {disabledReason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedPromotionId(null)}
              >
                Clear
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => setIsPromotionsModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
