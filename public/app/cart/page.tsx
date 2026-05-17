"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, Plus, Minus, Package, Tag, X } from "lucide-react";
import { cartEngine, CartItem } from "@/app/utils/cartEngine";
import { getProduct, listPromotions } from "@/lib/api/storefront";
import { formatMoney } from "@/lib/format";
import type { Product, PublicPromotion } from "@/lib/types/storefront";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  const [promotions, setPromotions] = useState<PublicPromotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [isPromotionsModalOpen, setIsPromotionsModalOpen] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const items = await cartEngine.getAllItems();
      setCartItems(items);

      const ids = new Set(items.map((i) => i.product_id));

      const entries = await Promise.all(
        [...ids].map(async (id) => {
          try {
            const product = await getProduct(id);
            return [id, product] as const;
          } catch {
            return null;
          }
        })
      );

      const map: Record<string, Product> = {};
      for (const entry of entries) {
        if (entry) map[entry[0]] = entry[1];
      }
      setProducts(map);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
    window.addEventListener("highkey:cart-updated", loadCart);
    return () => window.removeEventListener("highkey:cart-updated", loadCart);
  }, [loadCart]);

  useEffect(() => {
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

  const handleRemove = async (cartItemId: string) => {
    await cartEngine.removeItem(cartItemId);
    setCartItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId && i.referenceId !== cartItemId));
  };

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      await handleRemove(cartItemId);
      return;
    }
    await cartEngine.updateItemQuantity(cartItemId, newQuantity);
    setCartItems((prev) =>
      prev.map((i) =>
        i.cart_item_id === cartItemId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const cartSubtotalCents = cartItems.reduce((acc, item) => {
    const product = products[item.product_id];
    if (product) {
      return acc + product.basePriceCents * item.quantity;
    }
    return acc;
  }, 0);

  const isEmpty = cartItems.length === 0;
  
  // Group items
  const topLevelItems = cartItems.filter(i => i.standalone !== false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-background pt-32 pb-24 px-6"
    >
      <div className="max-w-[720px] mx-auto">
        <h1 className="font-heading font-light text-4xl md:text-5xl mb-12">
          Your Cart
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-24 border border-dashed border-border rounded-xl bg-surface">
            <p className="text-muted mb-6">Your cart is completely empty.</p>
            <Link href="/shop">
              <Button size="lg" className="rounded-full shadow-sm">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              {topLevelItems.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;
                const isCustomBase = !!item.customizationMeta;
                const children = cartItems.filter(i => i.referenceId === item.cart_item_id);

                return (
                  <motion.div
                    key={item.cart_item_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col p-6 border border-border/60 hover:border-border rounded-[20px] bg-card hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6 w-full">
                      <div className="w-full md:w-[160px] aspect-[4/3] bg-secondary/20 rounded-[12px] border border-border/50 flex items-center justify-center overflow-hidden relative">
                        {product.imageIds[0] ? (
                          <Image
                            src={product.imageIds[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xs text-muted">No Preview</span>
                        )}
                        {isCustomBase && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-heading bg-primary/10 text-primary">
                            {children.length} PATCHES
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <motion.div
                            layout
                            className="flex justify-between items-start mb-1"
                          >
                            <motion.div layout>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                                {product.productType}
                                {isCustomBase ? " · Custom" : ""}
                              </div>
                              <h3 className="font-heading text-2xl font-light text-foreground">
                                {product.name}
                              </h3>
                            </motion.div>
                            <p className="font-medium text-foreground text-xl">
                              {formatMoney(
                                product.basePriceCents * item.quantity,
                                product.currencyCode
                              )}
                            </p>
                          </motion.div>
                          <p className="text-sm text-muted/80 mt-2 line-clamp-2 max-w-[80%]">
                            {product.description || "No description available."}
                          </p>
                        </div>

                        <div className="mt-6 flex justify-between items-end">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 bg-secondary/20 border border-border/60 rounded-full px-4 py-1.5">
                              <button
                                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                                className="text-muted hover:text-foreground"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-medium w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                                className="text-muted hover:text-foreground"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(item.cart_item_id)}
                              className="text-xs font-medium text-muted hover:text-destructive flex items-center gap-1.5"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                          {isCustomBase ? (
                            <Link
                              href={`/customize?product_id=${product.id}&cart_item_id=${item.cart_item_id}`}
                              className="text-sm font-medium text-primary hover:underline underline-offset-4"
                            >
                              Edit design &rarr;
                            </Link>
                          ) : (
                            <Link
                              href={`/view?product_id=${product.id}`}
                              className="text-sm font-medium text-primary hover:underline underline-offset-4"
                            >
                              View piece &rarr;
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Render customized children */}
                    {isCustomBase && children.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-dashed border-border/60 pl-4 md:pl-[184px]">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Included Patches</h4>
                        <div className="flex flex-col gap-3">
                          {children.map((child) => {
                            const childProduct = products[child.product_id];
                            if (!childProduct) return null;
                            return (
                              <div key={child.cart_item_id} className="flex justify-between items-center bg-secondary/10 px-4 py-2 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-white rounded-md border border-border/50 flex items-center justify-center p-1">
                                    {childProduct.imageIds?.[0] ? (
                                      <Image src={childProduct.imageIds[0]} alt="" width={32} height={32} className="object-contain" unoptimized />
                                    ) : (
                                      <Package className="w-4 h-4 text-muted" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{childProduct.name}</span>
                                  <span className="text-xs text-muted">x{child.quantity}</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {formatMoney(childProduct.basePriceCents * child.quantity, childProduct.currencyCode)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-col items-end w-full border-t border-border pt-8">
              <div className="w-full md:w-[320px] flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">
                    {formatMoney(
                      cartSubtotalCents,
                      cartItems[0]
                        ? products[cartItems[0].product_id]?.currencyCode
                        : "SGD"
                    )}
                  </span>
                </div>

                {selectedPromotionId && (() => {
                  const promo = promotions.find(p => p.id === selectedPromotionId);
                  return promo ? (
                    <motion.div layout className="flex justify-between items-center text-sm text-green-600">
                      <span className="flex items-center gap-1.5">
                        <Tag size={12} />
                        {promo.discountPercentage
                          ? `${promo.discountPercentage}% OFF applied`
                          : promo.discountValueCents
                          ? `${formatMoney(promo.discountValueCents, "SGD")} OFF applied`
                          : "Promotion applied"}
                      </span>
                      <button
                        onClick={() => setSelectedPromotionId(null)}
                        className="text-muted hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ) : null;
                })()}

                <motion.div layout className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="text-muted italic">
                    Calculated at checkout
                  </span>
                </motion.div>
                <div className="h-px w-full bg-border my-2" />
                <div className="flex justify-between items-end mb-2">
                  <span className="text-muted font-medium">Total</span>
                  <span className="font-heading font-medium text-3xl text-primary leading-none">
                    {formatMoney(
                      cartSubtotalCents,
                      cartItems[0]
                        ? products[cartItems[0].product_id]?.currencyCode
                        : "SGD"
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPromotionsModalOpen(true)}
                  className="w-full py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Tag size={14} />
                  {selectedPromotionId ? "Change Promotion" : "View Promotions"}
                </button>

                <Link href="/checkout">
                  <Button size="lg" className="w-full rounded-full shadow-hover text-lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/shop" className="w-full text-center">
                  <Button variant="ghost" className="w-full text-muted">
                    <ArrowLeft size={16} className="mr-2" /> Continue shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>

    {/* Promotions Modal */}
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
    </>
  );
}
