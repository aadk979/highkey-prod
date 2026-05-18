"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ProductsLoadError } from "./productsLoadError";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Sparkles,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { productPath } from "@/lib/seo";
import type { Product } from "@/lib/types/storefront";

function ProductCard({
  item,
  index,
  featured,
}: {
  item: Product;
  index: number;
  featured: boolean;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(springY, [0, 1], [4, -4]);
  const rotateY = useTransform(springX, [0, 1], [-4, 4]);

  const isBuildable = item.productType === "base" && item.isCustomizable;
  const lowStock =
    item.availableStock > 0 && item.availableStock <= 5;
  const outOfStock = item.availableStock <= 0;

  const navigate = () => router.push(productPath(item.id));
  const navigateAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBuildable) {
      router.push(`/build?product_id=${item.id}`);
    } else {
      navigate();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={featured ? "sm:col-span-2 sm:row-span-1" : ""}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        onClick={navigate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(); }}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        className="group relative w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[28px]"
        aria-label={`View ${item.name}`}
      >
        <motion.div
          animate={{ y: hovered ? -6 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-section via-surface to-background shadow-multi ${
            featured ? "aspect-[16/11] sm:aspect-[16/10]" : "aspect-[4/5]"
          }`}
        >
          {/* Denim grain texture */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.35] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Stitch accent */}
          <motion.div
            className="absolute left-6 top-6 z-20 flex items-center gap-2"
            initial={false}
            animate={{ opacity: hovered ? 1 : 0.85, y: hovered ? 0 : 2 }}
          >
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground border border-border/60 shadow-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
            {isBuildable && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/15">
                <Sparkles className="w-3 h-3" />
                Custom
              </span>
            )}
          </motion.div>

          {/* Image */}
          <div className="absolute inset-0 z-0 flex items-center justify-center p-6 sm:p-8">
            {item.imageIds[0] ? (
              <motion.div
                className="relative w-full h-full"
                animate={{ scale: hovered ? 1.08 : 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={item.imageIds[0]}
                  alt={item.name}
                  fill
                  className="object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                  sizes={
                    featured
                      ? "(min-width: 640px) 66vw, 100vw"
                      : "(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  }
                  unoptimized
                />
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: hovered ? 1.05 : 1 }}
                className="flex flex-col items-center justify-center text-muted/50 gap-3"
              >
                <ImageIcon strokeWidth={1} className="w-12 h-12" />
                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                  Preview soon
                </span>
              </motion.div>
            )}
          </div>

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent p-6 sm:p-8"
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={false}
              animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-end justify-between gap-4"
            >
              <div className="min-w-0 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 mb-1">
                  {item.productType}
                </p>
                <p className="font-heading text-xl sm:text-2xl font-light leading-tight truncate">
                  {item.name}
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </motion.div>
          </motion.div>

          {/* Stock pill */}
          {(lowStock || outOfStock) && (
            <div className="absolute right-4 top-4 z-20">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                  outOfStock
                    ? "bg-foreground/80 text-white border-white/20"
                    : "bg-primary text-primary-foreground border-primary"
                }`}
              >
                {outOfStock ? "Sold out" : `${item.availableStock} left`}
              </span>
            </div>
          )}
        </motion.div>

        {/* Info row — visible when not hovering on touch; always on mobile */}
        <div className="mt-4 flex items-start justify-between gap-4 px-1 sm:group-hover:opacity-0 sm:opacity-100 transition-opacity duration-300">
          <motion.div
            animate={{ opacity: hovered ? 0 : 1 }}
            className="min-w-0 flex-1 sm:block"
          >
            <Link href={productPath(item.id)} className="block hover:text-primary">
              <h3
                className={`font-heading text-foreground font-light leading-tight tracking-tight truncate ${
                  featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
                title={item.name}
              >
                {item.name}
              </h3>
            </Link>
            <p className="mt-1 text-primary font-medium text-lg">
              {formatMoney(item.basePriceCents, item.currencyCode)}
            </p>
          </motion.div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-semibold px-5 h-9 border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              onClick={navigateAction}
            >
              {isBuildable ? "Build" : "View"}
            </Button>
            <span className="inline-flex items-center gap-1 rounded-full bg-section text-muted text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider border border-border/50">
              <Package className="w-3 h-3" />
              {item.productType}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function ProductDisplay({
  products,
  loadError,
}: {
  products: Product[];
  loadError: boolean;
}) {
  if (loadError) {
    return <ProductsLoadError />;
  }

  if (products.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto text-center py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-section border border-border flex items-center justify-center">
            <Package className="w-7 h-7 text-muted" />
          </div>
          <p className="text-2xl font-heading font-light text-foreground">
            No pieces in this collection yet.
          </p>
          <p className="text-sm text-muted max-w-sm">
            Check back soon or try another filter — new denim drops land here
            first.
          </p>
        </motion.div>
      </div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-[1280px] mx-auto"
    >
      <div className="mb-8 flex items-end justify-between gap-4 px-1 border-b border-border/60 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
          Collection
        </p>
        <p className="text-sm text-muted">
          <span className="text-foreground font-medium">{products.length}</span>{" "}
          {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        {products.map((item, i) => (
          <ProductCard
            key={item.id}
            item={item}
            index={i}
            featured={i === 0 && products.length > 2}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
