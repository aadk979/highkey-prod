import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Order Tracking",
  "Look up a Highkey order with a private order token.",
  "/order"
);

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
