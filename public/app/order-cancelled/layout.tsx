import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Order Cancelled",
  "Return to Highkey after a cancelled checkout.",
  "/order-cancelled"
);

export default function OrderCancelledLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
