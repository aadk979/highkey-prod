import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/shop", "/products/"],
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/order",
        "/order-cancelled",
        "/build",
        "/customize",
        "/view",
        "/Temporary-data/",
        "/utils/",
        "/*?*token=",
        "/*?*cart_item_id=",
        "/*?*product_id=",
        "/*?*preview=",
        "/*?*sort=",
        "/*?*filter=",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
