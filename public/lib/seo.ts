import type { Metadata } from "next";
import type { Product } from "@/lib/types/storefront";

export const SITE_NAME = "Highkey";
export const SITE_TAGLINE = "Upcycled Denim Keychains";
export const SITE_LOCALE = "en_SG";
export const SITE_LANGUAGE = "en-SG";

// Replace NEXT_PUBLIC_SITE_URL with the canonical production origin before launch.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://highkey.example.com"
).replace(/\/$/, "");

export const SITE_DESCRIPTION =
  "Shop customizable keychains handcrafted from reclaimed denim, finished with patches, and made for everyday carry.";

export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalPath(path = "/") {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

type SeoMetadataOptions = {
  title: string | Metadata["title"];
  description: string;
  path: string;
  image?: string;
  robots?: Metadata["robots"];
  type?: "website" | "article";
};

export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  robots,
  type = "website",
}: SeoMetadataOptions): Metadata {
  const canonical = canonicalPath(path);
  const url = absoluteUrl(canonical);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-SG": canonical,
      },
    },
    openGraph: {
      title: typeof title === "string" ? title : SITE_NAME,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: typeof title === "string" ? title : SITE_NAME,
      description,
      images: [imageUrl],
    },
    robots,
  };
}

export function noindexMetadata(title: string, description: string, path: string): Metadata {
  return buildMetadata({
    title,
    description,
    path,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  });
}

export function productPath(id: string) {
  return `/products/${encodeURIComponent(id)}`;
}

export function productDescription(product: Product) {
  return (
    product.description ||
    `${product.name} is a handcrafted ${product.productType === "base" ? "customizable denim keychain base" : "denim accessory"} made from upcycled denim.`
  );
}

export function truncateDescription(value: string, maxLength = 155) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}.`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.svg"),
    description: SITE_DESCRIPTION,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product) {
  const description = productDescription(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`${productPath(product.id)}#product`),
    name: product.name,
    description,
    image: product.imageIds?.map((image) => absoluteUrl(image)) ?? [],
    url: absoluteUrl(productPath(product.id)),
    sku: product.id,
    category:
      product.productType === "base"
        ? "Customizable upcycled denim keychain"
        : "Upcycled denim accessory",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    material: "Upcycled denim",
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productPath(product.id)),
      priceCurrency: product.currencyCode,
      price: (product.basePriceCents / 100).toFixed(2),
      availability:
        product.availableStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function collectionPageJsonLd(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/shop#collection"),
    name: "Shop upcycled denim keychains",
    url: absoluteUrl("/shop"),
    description:
      "Browse customizable keychain bases and accessories made from reclaimed denim.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(productPath(product.id)),
        name: product.name,
      })),
    },
  };
}
