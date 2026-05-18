import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Product Preview",
  "Legacy Highkey product preview route.",
  "/view"
);

export default function ViewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
