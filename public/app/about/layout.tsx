import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Highkey Upcycled Denim Accessories",
  description:
    "Learn how Highkey turns reclaimed jeans into durable, customizable denim keychains with a lower-waste material philosophy.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
