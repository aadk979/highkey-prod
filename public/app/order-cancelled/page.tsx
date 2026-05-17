"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderCancelledPage() {
  return (
    <div className="flex-1 flex items-center justify-center pt-32 pb-24 px-6 min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[480px] w-full bg-surface border border-border p-8 md:p-12 rounded-3xl text-center shadow-sm"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        
        <h1 className="font-heading text-3xl mb-4 text-foreground">
          Payment Cancelled
        </h1>
        
        <p className="text-muted leading-relaxed mb-8">
          Your payment was cancelled and your order has not been placed. 
          You can return to your cart to try again or continue shopping.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cart" className="flex-1">
            <Button variant="outline" className="w-full rounded-full h-12">
              Return to Cart
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button className="w-full rounded-full h-12">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
