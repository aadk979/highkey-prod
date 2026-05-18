import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata(
  "Customization Studio",
  "Customize a Highkey denim keychain before adding it to your bag.",
  "/customize"
);

export default function CustomizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
