import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { replaceImageOrigins } from "@/lib/api/client";
import { getProduct } from "@/lib/api/storefront";
import {
  breadcrumbJsonLd,
  buildMetadata,
  productDescription,
  productJsonLd,
  productPath,
  truncateDescription,
} from "@/lib/seo";
import type { Product } from "@/lib/types/storefront";
import { ProductViewContent } from "@/app/view/page";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

async function getRequestOrigin() {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host");

  if (!host) return undefined;

  const protocol =
    headersList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const hostname = host.split(",")[0]?.trim();

  return hostname ? `${protocol}://${hostname}` : undefined;
}

async function getProductSafely(
  id: string,
  origin?: string
): Promise<Product | null> {
  try {
    const product = await getProduct(id);
    if (!product.isActive) return null;

    return origin
      ? (replaceImageOrigins(product, origin) as Product)
      : product;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const { id } = await params;
  const origin = await getRequestOrigin();
  const product = await getProductSafely(id, origin);

  if (!product) {
    return buildMetadata({
      title: "Product unavailable",
      description:
        "This Highkey product is currently unavailable. Browse the full collection of upcycled denim keychains.",
      path: productPath(id),
      robots: {
        index: false,
        follow: true,
      },
    });
  }

  const description = truncateDescription(productDescription(product));

  return buildMetadata({
    title: `${product.name} - Upcycled Denim ${product.productType === "base" ? "Keychain Base" : "Accessory"}`,
    description,
    path: productPath(product.id),
    image: product.imageIds?.[0] || undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const origin = await getRequestOrigin();
  const product = await getProductSafely(id, origin);

  return (
    <>
      {product && (
        <JsonLd
          data={[
            productJsonLd(product),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: product.name, path: productPath(product.id) },
            ]),
          ]}
        />
      )}
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
              Loading
            </p>
          </div>
        }
      >
        <ProductViewContent productId={id} initialProduct={product} />
      </Suspense>
    </>
  );
}
