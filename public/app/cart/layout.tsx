import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Cart",
  "Review selected Highkey pieces before checkout.",
  "/cart"
);

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
