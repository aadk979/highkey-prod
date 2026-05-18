import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/api/storefront";
import { absoluteUrl, productPath } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const products = await listProducts({ page: 1, limit: 100 });
    const productRoutes: MetadataRoute.Sitemap = products.data
      .filter((product) => product.isActive)
      .map((product) => ({
        url: absoluteUrl(productPath(product.id)),
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: "weekly",
        priority: product.productType === "base" ? 0.8 : 0.65,
        images: product.imageIds?.slice(0, 3).map((image) => absoluteUrl(image)),
      }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
