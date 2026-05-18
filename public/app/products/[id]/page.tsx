import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
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

async function getProductSafely(id: string): Promise<Product | null> {
  try {
    const product = await getProduct(id);
    return product.isActive ? product : null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductSafely(id);

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
  const product = await getProductSafely(id);

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
