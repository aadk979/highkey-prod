"use client";

import { useEffect, useState } from "react";
import { cartEngine } from "@/app/utils/cartEngine";

export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const total = await cartEngine.getTotalQuantity();
        if (mounted) setCount(total);
      } catch {
        if (mounted) setCount(0);
      }
    }

    refresh();
    window.addEventListener("highkey:cart-updated", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("highkey:cart-updated", refresh);
    };
  }, []);

  return count;
}

export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("highkey:cart-updated"));
  }
}
