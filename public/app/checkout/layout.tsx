import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Checkout",
  "Complete your Highkey order securely.",
  "/checkout"
);

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
