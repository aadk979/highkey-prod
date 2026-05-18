import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Keychain Builder",
  "Design a custom Highkey denim keychain with patches.",
  "/build"
);

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return children;
}
