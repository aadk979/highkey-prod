"use client";

import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Package, Search } from "lucide-react";
import { getOrder } from "@/lib/api/storefront";
import type { Order } from "@/lib/types/storefront";
import { StorefrontApiError } from "@/lib/api/client";
import { OrderDetails } from "./orderDetails";
import { cartEngine } from "@/app/utils/cartEngine";

function OrderLookupForm({
  lookupToken,
  setLookupToken,
  onSubmit,
}: {
  lookupToken: string;
  setLookupToken: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 pt-32 pb-24 px-6"
    >
      <div className="max-w-[520px] mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-3">
            Track your order
          </h1>
          <p className="text-muted text-[17px] leading-relaxed">
            Enter the reference token from your confirmation email to view status,
            items, and delivery details.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm"
        >
          <label
            htmlFor="order-token"
            className="block text-xs font-bold uppercase tracking-wider text-muted mb-2"
          >
            Order token
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="order-token"
              value={lookupToken}
              onChange={(e) => setLookupToken(e.target.value)}
              placeholder="e.g. 21b7ab7d9419c2e8f44be71bdbdf4d67"
              className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoComplete="off"
            />
            <Button
              type="submit"
              className="rounded-full px-8 h-12 shrink-0"
              disabled={!lookupToken.trim()}
            >
              <Search size={16} className="mr-2" />
              Look up
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Need help?{" "}
          <Link href="/about" className="text-primary hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function OrderLookupContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [lookupToken, setLookupToken] = useState(token ?? "");

  useEffect(() => {
    if (!token) return;
    const orderToken = token;
    async function load() {
      try {
        const data = await getOrder(orderToken);
        setOrder(data);
        await cartEngine.clearCart();
      } catch (err) {
        setError(
          err instanceof StorefrontApiError
            ? err.message
            : "Could not find this order."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupToken.trim()) return;
    window.location.href = `/order?token=${encodeURIComponent(lookupToken.trim())}`;
  };

  if (!token) {
    return (
      <OrderLookupForm
        lookupToken={lookupToken}
        setLookupToken={setLookupToken}
        onSubmit={handleLookup}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <p className="text-sm text-muted">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-[480px] mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-heading text-2xl mb-2">Order not found</h2>
          <p className="text-muted mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/order">
              <Button variant="outline" className="rounded-full w-full sm:w-auto">
                Try another token
              </Button>
            </Link>
            <Link href="/shop">
              <Button className="rounded-full w-full sm:w-auto">Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-28 pb-24 px-6">
      <div className="max-w-[960px] mx-auto mb-6">
        <Link
          href="/order"
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          ← Look up a different order
        </Link>
      </div>
      <OrderDetails order={order} />
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[50vh] flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </motion.div>
      }
    >
      <OrderLookupContent />
    </Suspense>
  );
}
