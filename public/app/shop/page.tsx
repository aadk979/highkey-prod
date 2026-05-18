import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { listProducts } from "@/lib/api/storefront";
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
} from "@/lib/seo";
import type { PaginatedProducts } from "@/lib/types/storefront";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = buildMetadata({
  title: "Shop Custom Upcycled Denim Keychains",
  description:
    "Browse handcrafted denim keychain bases and accessories made from reclaimed jeans, then customize your piece with patches.",
  path: "/shop",
});

async function getInitialProducts(): Promise<PaginatedProducts | null> {
  try {
    return await listProducts({ page: 1, limit: 20 });
  } catch {
    return null;
  }
}

export default async function ShopPage() {
  const initialProducts = await getInitialProducts();
  const products = initialProducts?.data ?? [];

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(products),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
        ]}
      />
      <ShopClient initialProducts={initialProducts} />
    </>
  );
}
