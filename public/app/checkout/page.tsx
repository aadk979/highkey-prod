"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Edit3,
  MapPin,
  ReceiptText,
  Truck,
  User,
  X,
} from "lucide-react";
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

type CheckoutStep = "contact" | "fulfillment" | "notes" | "promotions" | "quote";

type DeliveryAddressFields = {
  block: string;
  street: string;
  building: string;
  unit: string;
  postalCode: string;
  instructions: string;
};

const checkoutSteps: {
  id: CheckoutStep;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "contact", label: "Customer", icon: User },
  { id: "fulfillment", label: "Fulfillment", icon: Truck },
  { id: "notes", label: "Notes", icon: ClipboardList },
  { id: "promotions", label: "Promotions", icon: BadgePercent },
  { id: "quote", label: "Quote", icon: ReceiptText },
];

const emptyAddress: DeliveryAddressFields = {
  block: "",
  street: "",
  building: "",
  unit: "",
  postalCode: "",
  instructions: "",
};

const fieldClass =
  "w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-primary";

function buildDeliveryAddress(fields: DeliveryAddressFields): string {
  const blockAndStreet = [fields.block.trim(), fields.street.trim()]
    .filter(Boolean)
    .join(" ");
  const unit = fields.unit.trim();
  const formattedUnit = unit && !unit.startsWith("#") ? `#${unit}` : unit;
  const core = [
    blockAndStreet,
    fields.building.trim(),
    formattedUnit,
    `Singapore ${fields.postalCode.trim()}`,
  ].filter(Boolean);
  const instructions = fields.instructions.trim();

  return instructions ? `${core.join(", ")}. ${instructions}` : core.join(", ");
}

function getPromotionLabel(promo: PublicPromotion): string {
  if (promo.discountPercentage) {
    return `${promo.discountPercentage}% off`;
  }

  if (promo.discountValueCents) {
    return `${formatMoney(promo.discountValueCents, "SGD")} off`;
  }

  return "Promotion";
}

function getPromotionDisabledReason(
  promo: PublicPromotion,
  cartItems: CartItem[]
): string | null {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);

  if (now < start || now > end) {
    return "Not currently active";
  }

  if (!promo.storeWide && promo.productId) {
    const hasProduct = cartItems.some((item) => item.product_id === promo.productId);
    if (!hasProduct) {
      return "Required product not in cart";
    }
  }

  return null;
}

function CheckoutContent() {
  const [locations, setLocations] = useState<CollectionLocation[]>([]);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartEmpty, setCartEmpty] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [promotions, setPromotions] = useState<PublicPromotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

  const [step, setStep] = useState<CheckoutStep>("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+65");
  const [phone, setPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethodSession>("self_collect");
  const [collectionLocationId, setCollectionLocationId] = useState("");
  const [deliveryAddress, setDeliveryAddress] =
    useState<DeliveryAddressFields>(emptyAddress);

  useEffect(() => {
    let active = true;

    Promise.all([
      cartEngine.getAllItems(),
      listCollectionLocations().catch(() => []),
      listPromotions({ limit: 100 }).then((res) => res.data).catch(() => []),
    ])
      .then(([items, collectionLocations, promotionList]) => {
        if (!active) return;
        setCartItems(items);
        setCartEmpty(items.length === 0);
        setLocations(collectionLocations);
        setPromotions(promotionList);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === collectionLocationId),
    [collectionLocationId, locations]
  );

  const selectedPromotion = useMemo(
    () => promotions.find((promotion) => promotion.id === selectedPromotionId),
    [promotions, selectedPromotionId]
  );

  const deliveryAddressString = useMemo(
    () => buildDeliveryAddress(deliveryAddress),
    [deliveryAddress]
  );

  const currentStepIndex = checkoutSteps.findIndex((item) => item.id === step);
  const canContinueContact =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    countryCode.trim().length > 0 &&
    phone.trim().length > 0;
  const canContinueFulfillment =
    fulfillment === "self_collect"
      ? collectionLocationId.trim().length > 0
      : deliveryAddress.block.trim().length > 0 &&
        deliveryAddress.street.trim().length > 0 &&
        /^\d{6}$/.test(deliveryAddress.postalCode.trim());
  const canRequestQuote = canContinueContact && canContinueFulfillment;

  const invalidateQuote = () => {
    if (quote) setQuote(null);
    setConfirmOpen(false);
  };

  const updateAddress = (field: keyof DeliveryAddressFields, value: string) => {
    invalidateQuote();
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  };

  const goToStep = (target: CheckoutStep) => {
    const targetIndex = checkoutSteps.findIndex((item) => item.id === target);
    if (targetIndex <= currentStepIndex || target === "contact") {
      setStep(target);
      return;
    }

    if (targetIndex === 1 && canContinueContact) setStep(target);
    if (targetIndex > 1 && canContinueContact && canContinueFulfillment) {
      setStep(target);
    }
  };

  const handleNext = () => {
    setError(null);

    if (step === "contact" && canContinueContact) setStep("fulfillment");
    if (step === "fulfillment" && canContinueFulfillment) setStep("notes");
    if (step === "notes") setStep("promotions");
    if (step === "promotions") setStep("quote");
  };

  const buildRequestParts = async () => {
    const items = await cartEngine.getAllItems();
    if (items.length === 0) {
      setCartEmpty(true);
      throw new Error("Cart is empty");
    }

    setCartItems(items);

    const customizedBase = items.find((item) => item.customizationMeta);
    const customizationMeta = customizedBase?.customizationMeta;
    const checkoutItems = items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }));

    return { items, checkoutItems, customizationMeta };
  };

  const handleGetQuote = async () => {
    if (!canRequestQuote) return;

    setQuoteLoading(true);
    setError(null);

    try {
      const { checkoutItems, customizationMeta } = await buildRequestParts();
      const result = await getCheckoutQuote({
        customer: { name, email, countryCode, phone },
        customerNote,
        fulfillment: {
          method: fulfillment === "self_collect" ? "self_collect" : "delivery",
          collectionLocationId:
            fulfillment === "self_collect" ? collectionLocationId : undefined,
          deliveryAddress:
            fulfillment === "delivery" ? deliveryAddressString : undefined,
        },
        items: checkoutItems,
        promotionId: selectedPromotionId,
        customizationMeta,
      });

      setQuote(result);
    } catch (err) {
      if (err instanceof StorefrontApiError) {
        setError(err.message);
      } else if (!cartEmpty) {
        setError("Could not calculate your order total.");
      }
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCreateSession = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const { checkoutItems, customizationMeta } = await buildRequestParts();
      const session = await createCheckoutSession({
        items: checkoutItems,
        customer: { name, email, countryCode, phone },
        customerNote: customerNote.trim() ? customerNote : null,
        promotionId: selectedPromotionId,
        fulfillment: {
          method: fulfillment,
          collectionLocationId:
            fulfillment === "self_collect" ? collectionLocationId : null,
          deliveryAddress:
            fulfillment === "delivery" ? deliveryAddressString : null,
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
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 bg-background pt-32 pb-24 px-6"
      >
        <motion.div layout className="max-w-[1120px] mx-auto">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-muted hover:text-primary mb-8"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to cart
          </Link>

          <div className="flex flex-col gap-3 mb-10">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Checkout
            </p>
            <h1 className="font-heading font-light text-4xl md:text-5xl">
              Finish your order one step at a time.
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4 lg:order-2">
              <div className="lg:sticky lg:top-28 border border-border rounded-xl bg-surface p-5">
                <div className="flex flex-col gap-2">
                  {checkoutSteps.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.id === step;
                    const isComplete = index < currentStepIndex || (item.id === "quote" && !!quote);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goToStep(item.id)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                          isActive
                            ? "border-primary bg-primary/5 text-foreground"
                            : isComplete
                            ? "border-border bg-background text-foreground"
                            : "border-transparent text-muted"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isComplete
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted"
                          }`}
                        >
                          {isComplete ? <Check size={15} /> : <Icon size={15} />}
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        {isActive && <ChevronRight size={16} />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-border pt-5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Items</span>
                    <span className="font-medium">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-muted">Promotion</span>
                    <span className="font-medium">
                      {selectedPromotion ? getPromotionLabel(selectedPromotion) : "None"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-muted">Total</span>
                    <span className="font-heading text-2xl text-primary">
                      {quote ? formatMoney(quote.grandTotalCents, quote.currencyCode) : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            <main className="lg:col-span-8 lg:order-1">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (step === "quote") {
                    void handleGetQuote();
                  } else {
                    handleNext();
                  }
                }}
                className="border border-border rounded-xl bg-surface p-5 md:p-7"
              >
                {step === "contact" && (
                  <motion.section
                    key="contact"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-6">
                      <h2 className="font-heading text-2xl">Customer details</h2>
                      <p className="text-sm text-muted mt-2">
                        We will use this for your order confirmation and delivery updates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="text-sm font-medium">
                        Full name
                        <input
                          required
                          value={name}
                          onChange={(event) => {
                            invalidateQuote();
                            setName(event.target.value);
                          }}
                          className={`${fieldClass} mt-2`}
                        />
                      </label>
                      <label className="text-sm font-medium">
                        Email
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(event) => {
                            invalidateQuote();
                            setEmail(event.target.value);
                          }}
                          className={`${fieldClass} mt-2`}
                        />
                      </label>
                      <label className="text-sm font-medium">
                        Country code
                        <input
                          required
                          value={countryCode}
                          onChange={(event) => {
                            invalidateQuote();
                            setCountryCode(event.target.value);
                          }}
                          className={`${fieldClass} mt-2`}
                        />
                      </label>
                      <label className="text-sm font-medium">
                        Phone
                        <input
                          required
                          inputMode="tel"
                          value={phone}
                          onChange={(event) => {
                            invalidateQuote();
                            setPhone(event.target.value);
                          }}
                          className={`${fieldClass} mt-2`}
                        />
                      </label>
                    </div>
                  </motion.section>
                )}

                {step === "fulfillment" && (
                  <motion.section
                    key="fulfillment"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl">Fulfillment</h2>
                        <p className="text-sm text-muted mt-2">
                          Choose collection or a Singapore delivery address.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("contact")}
                      >
                        <Edit3 size={14} /> Contact
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {(
                        [
                          ["self_collect", "Self collect", MapPin],
                          ["delivery", "Delivery", Truck],
                        ] as const
                      ).map(([value, label, Icon]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            invalidateQuote();
                            setFulfillment(value);
                          }}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                            fulfillment === value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted hover:text-foreground"
                          }`}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      ))}
                    </div>

                    {fulfillment === "self_collect" ? (
                      <label className="text-sm font-medium">
                        Collection point
                        <select
                          required
                          value={collectionLocationId}
                          onChange={(event) => {
                            invalidateQuote();
                            setCollectionLocationId(event.target.value);
                          }}
                          className={`${fieldClass} mt-2`}
                        >
                          <option value="">Select collection point</option>
                          {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name} - {location.address}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="text-sm font-medium">
                          Block / house no.
                          <input
                            required
                            value={deliveryAddress.block}
                            onChange={(event) => updateAddress("block", event.target.value)}
                            className={`${fieldClass} mt-2`}
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Street name
                          <input
                            required
                            value={deliveryAddress.street}
                            onChange={(event) => updateAddress("street", event.target.value)}
                            className={`${fieldClass} mt-2`}
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Building / estate
                          <input
                            value={deliveryAddress.building}
                            onChange={(event) => updateAddress("building", event.target.value)}
                            className={`${fieldClass} mt-2`}
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Unit
                          <input
                            placeholder="#12-34"
                            value={deliveryAddress.unit}
                            onChange={(event) => updateAddress("unit", event.target.value)}
                            className={`${fieldClass} mt-2`}
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Postal code
                          <input
                            required
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={deliveryAddress.postalCode}
                            onChange={(event) =>
                              updateAddress(
                                "postalCode",
                                event.target.value.replace(/\D/g, "")
                              )
                            }
                            className={`${fieldClass} mt-2`}
                          />
                        </label>
                        <label className="text-sm font-medium sm:col-span-2">
                          Delivery instructions
                          <textarea
                            value={deliveryAddress.instructions}
                            onChange={(event) =>
                              updateAddress("instructions", event.target.value)
                            }
                            rows={3}
                            className={`${fieldClass} mt-2 resize-none`}
                          />
                        </label>
                      </div>
                    )}
                  </motion.section>
                )}

                {step === "notes" && (
                  <motion.section
                    key="notes"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl">Order notes</h2>
                        <p className="text-sm text-muted mt-2">
                          Add anything the Highkey team should know before preparing this.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("fulfillment")}
                      >
                        <Edit3 size={14} /> Fulfillment
                      </Button>
                    </div>

                    <textarea
                      placeholder="Optional"
                      value={customerNote}
                      onChange={(event) => {
                        invalidateQuote();
                        setCustomerNote(event.target.value);
                      }}
                      rows={5}
                      className={`${fieldClass} resize-none`}
                    />
                  </motion.section>
                )}

                {step === "promotions" && (
                  <motion.section
                    key="promotions"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl">Promotions</h2>
                        <p className="text-sm text-muted mt-2">
                          Choose one available promotion, or continue without one.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("notes")}
                      >
                        <Edit3 size={14} /> Notes
                      </Button>
                    </div>

                    {promotions.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border bg-background p-5 text-sm text-muted">
                        No promotions available right now.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            invalidateQuote();
                            setSelectedPromotionId(null);
                          }}
                          className={`rounded-lg border p-4 text-left transition-colors ${
                            selectedPromotionId === null
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">No promotion</span>
                          <span className="block text-sm text-muted mt-1">
                            Continue at regular pricing.
                          </span>
                        </button>

                        {promotions.map((promotion) => {
                          const disabledReason = getPromotionDisabledReason(
                            promotion,
                            cartItems
                          );
                          const isDisabled = disabledReason !== null;
                          const isSelected = promotion.id === selectedPromotionId;

                          return (
                            <button
                              key={promotion.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                invalidateQuote();
                                setSelectedPromotionId(isSelected ? null : promotion.id);
                              }}
                              className={`rounded-lg border p-4 text-left transition-colors ${
                                isDisabled
                                  ? "cursor-not-allowed border-border bg-secondary/10 opacity-50"
                                  : isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-background hover:border-primary/50"
                              }`}
                            >
                              <span className="flex items-center justify-between gap-3 font-medium">
                                {getPromotionLabel(promotion)}
                                {isSelected && <CheckCircle2 size={16} className="text-primary" />}
                              </span>
                              <span className="block text-sm text-muted mt-1">
                                {promotion.storeWide
                                  ? "Store-wide promotion"
                                  : "Product-specific promotion"}
                              </span>
                              <span className="block text-xs text-muted/70 mt-2">
                                Valid: {new Date(promotion.startDate).toLocaleDateString()} -{" "}
                                {new Date(promotion.endDate).toLocaleDateString()}
                              </span>
                              {isDisabled && (
                                <span className="mt-2 flex items-center gap-1 text-xs font-medium text-destructive">
                                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                  {disabledReason}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.section>
                )}

                {step === "quote" && (
                  <motion.section
                    key="quote"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl">Quote and payment</h2>
                        <p className="text-sm text-muted mt-2">
                          Calculate the final order total once your details are ready.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("promotions")}
                      >
                        <Edit3 size={14} /> Promotion
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-border bg-background p-4">
                        <span className="text-muted">Customer</span>
                        <p className="font-medium mt-1">{name}</p>
                        <p className="text-muted">{email}</p>
                        <p className="text-muted">
                          {countryCode} {phone}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-4">
                        <span className="text-muted">Fulfillment</span>
                        <p className="font-medium mt-1">
                          {fulfillment === "self_collect" ? "Self collect" : "Delivery"}
                        </p>
                        <p className="text-muted">
                          {fulfillment === "self_collect"
                            ? selectedLocation?.name || "Collection point"
                            : deliveryAddressString}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      className="mt-6 w-full rounded-full"
                      disabled={!canRequestQuote || quoteLoading}
                      onClick={() => void handleGetQuote()}
                    >
                      {quoteLoading ? "Calculating total..." : "Get final quote"}
                    </Button>

                    {quote && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 rounded-xl border border-border bg-background p-5"
                      >
                        <div className="flex flex-col gap-3 text-sm">
                          {quote.items.map((item) => (
                            <div key={item.productId} className="flex justify-between gap-4">
                              <span className="text-muted truncate">
                                {item.name} x {item.quantity}
                              </span>
                              <span>{formatMoney(item.lineTotalCents, quote.currencyCode)}</span>
                            </div>
                          ))}
                          <div className="h-px bg-border my-1" />
                          {quote.promotion?.applied && quote.discountTotalCents > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount applied</span>
                              <span>
                                -{formatMoney(quote.discountTotalCents, quote.currencyCode)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted">Shipping</span>
                            <span>
                              {formatMoney(quote.shippingTotalCents, quote.currencyCode)}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-medium pt-2">
                            <span>Total</span>
                            <span className="text-primary">
                              {formatMoney(quote.grandTotalCents, quote.currencyCode)}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="lg"
                          className="mt-5 w-full rounded-full"
                          onClick={() => setConfirmOpen(true)}
                        >
                          <CreditCard size={16} /> Pay with Stripe
                        </Button>
                      </motion.div>
                    )}
                  </motion.section>
                )}

                {error && (
                  <div className="mt-5 flex items-start gap-2 text-destructive text-sm p-3 bg-destructive/5 rounded-lg">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {step !== "quote" && (
                  <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={step === "contact"}
                      onClick={() => {
                        const previous = checkoutSteps[currentStepIndex - 1]?.id;
                        if (previous) setStep(previous);
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        (step === "contact" && !canContinueContact) ||
                        (step === "fulfillment" && !canContinueFulfillment)
                      }
                    >
                      Continue <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </form>
            </main>
          </div>
        </motion.div>
      </motion.div>

      {confirmOpen && quote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-2xl">Confirm order details</h3>
                <p className="text-sm text-muted mt-1">
                  We will create the Stripe payment link after you confirm.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 text-sm">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-muted">
                  {email} - {countryCode} {phone}
                </p>
              </div>
              <div>
                <p className="font-medium">
                  {fulfillment === "self_collect" ? "Self collect" : "Delivery"}
                </p>
                <p className="text-muted">
                  {fulfillment === "self_collect"
                    ? `${selectedLocation?.name || "Collection point"}${
                        selectedLocation?.address ? ` - ${selectedLocation.address}` : ""
                      }`
                    : deliveryAddressString}
                </p>
              </div>
              {customerNote.trim() && (
                <div>
                  <p className="font-medium">Order notes</p>
                  <p className="text-muted">{customerNote}</p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                <span className="font-medium">Total</span>
                <span className="font-heading text-2xl text-primary">
                  {formatMoney(quote.grandTotalCents, quote.currencyCode)}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false);
                  setStep("contact");
                }}
              >
                Edit details
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={() => void handleCreateSession()}
              >
                {submitting ? "Opening Stripe..." : "Confirm and pay"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
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
