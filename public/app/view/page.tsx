"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Leaf,
  Package,
  ShoppingBag,
  Wand2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { cartEngine } from "@/app/utils/cartEngine";
import { getProduct } from "@/lib/api/storefront";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types/storefront";
import { notifyCartUpdated } from "@/hooks/useCartCount";
import { replaceImageOrigins, StorefrontApiError } from "@/lib/api/client";

function ImageGallery({
  product,
  activeImageIndex,
  setActiveImageIndex,
  slideDirection,
  setSlideDirection,
}: {
  product: Product;
  activeImageIndex: number;
  setActiveImageIndex: (i: number) => void;
  slideDirection: number;
  setSlideDirection: (d: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const images = product.imageIds ?? [];
  const hasMultiple = images.length > 1;

  const goTo = useCallback(
    (idx: number) => {
      setSlideDirection(idx > activeImageIndex ? 1 : -1);
      setActiveImageIndex(idx);
    },
    [activeImageIndex, setActiveImageIndex, setSlideDirection]
  );

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    const next = (activeImageIndex - 1 + images.length) % images.length;
    goTo(next);
  }, [activeImageIndex, goTo, hasMultiple, images.length]);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    const next = (activeImageIndex + 1) % images.length;
    goTo(next);
  }, [activeImageIndex, goTo, hasMultiple, images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-[640px] mx-auto lg:max-w-none"
    >
      {/* Vertical thumbnails — desktop */}
      {hasMultiple && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="hidden lg:flex flex-col gap-3 order-2 lg:order-1"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`relative w-[72px] h-[88px] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                idx === activeImageIndex
                  ? "border-primary shadow-md scale-[1.02]"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
              }`}
              aria-label={`View image ${idx + 1}`}
              aria-current={idx === activeImageIndex}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              {idx === activeImageIndex && (
                <motion.div
                  layoutId="thumb-active"
                  className="absolute inset-0 ring-2 ring-inset ring-primary/30 rounded-2xl"
                />
              )}
            </button>
          ))}
        </motion.div>
      )}

      {/* Main stage */}
      <motion.div
        ref={containerRef}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        className="relative flex-1 order-1 lg:order-2"
      >
        <div className="relative aspect-[4/5] w-full rounded-[32px] overflow-hidden border border-border/60 bg-gradient-to-br from-section via-surface to-background shadow-multi">
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] opacity-[0.25] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          {images.length > 0 ? (
            <AnimatePresence initial={false} custom={slideDirection} mode="wait">
              <motion.div
                key={activeImageIndex}
                custom={slideDirection}
                initial={{ opacity: 0, scale: 0.96, x: slideDirection > 0 ? 40 : -40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.96, x: slideDirection > 0 ? -40 : 40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <motion.div
                  className="relative w-full h-full"
                  animate={{
                    scale: isZooming ? 1.35 : 1,
                  }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  }}
                >
                  <Image
                    src={images[activeImageIndex]}
                    alt={`${product.name} - Image ${activeImageIndex + 1}`}
                    fill
                    className="object-contain p-8 sm:p-10"
                    preload={activeImageIndex === 0}
                    unoptimized
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-muted/40"
            >
              <ImageIcon size={64} strokeWidth={1} />
              <span className="mt-4 text-xs font-bold uppercase tracking-[0.2em]">
                No preview
              </span>
            </motion.div>
          )}

          {/* Image counter */}
          {hasMultiple && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 border border-border/60 shadow-sm"
            >
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeImageIndex
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-border hover:bg-muted"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </motion.div>
          )}

          {/* Nav arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-border/60 shadow-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-border/60 shadow-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isZooming && images.length > 0 ? 1 : 0 }}
            className="absolute top-5 right-5 z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50"
          >
            Hover to zoom
          </motion.p>
        </div>

        {/* Horizontal thumbnails — mobile */}
        {hasMultiple && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                className={`relative flex-shrink-0 w-[72px] h-[88px] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  idx === activeImageIndex
                    ? "border-primary shadow-md"
                    : "border-transparent opacity-70"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function ProductViewContent({
  productId: productIdProp,
  initialProduct = null,
}: {
  productId?: string;
  initialProduct?: Product | null;
}) {
  const [product, setProduct] = useState<Product | null>(() =>
    initialProduct && typeof window !== "undefined"
      ? (replaceImageOrigins(initialProduct, window.origin) as Product)
      : initialProduct
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const params = useSearchParams();
  const productId = productIdProp ?? params.get("product_id") ?? undefined;

  useEffect(() => {
    async function fetchData() {
      if (initialProduct && productId === initialProduct.id) {
        setProduct(replaceImageOrigins(initialProduct, window.origin) as Product);
        setLoading(false);
        return;
      }

      if (!productId) {
        setError("No product ID provided.");
        setLoading(false);
        return;
      }

      try {
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err) {
        setError(
          err instanceof StorefrontApiError
            ? err.message
            : "Failed to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [initialProduct, productId]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product || product.availableStock <= 0) return;
    try {
      setIsAddingToCart(true);
      await cartEngine.addItem(product.id, 1);
      notifyCartUpdated();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      /* cart storage failed */
    } finally {
      setIsAddingToCart(false);
    }
  }, [product]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-background"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
          Loading piece
        </p>
      </motion.div>
    );
  }

  if (error || !product) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[70vh] flex flex-col items-center justify-center bg-background p-6 text-center"
      >
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-3xl font-heading font-light mb-2">Piece not found</h2>
        <p className="text-muted mb-8 max-w-md">
          {error || "We couldn't find the piece you're looking for."}
        </p>
        <Link href="/shop">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to shop
          </Button>
        </Link>
      </motion.div>
    );
  }

  const isBuildable = product.productType === "base";
  const inStock = product.availableStock > 0;
  const lowStock = inStock && product.availableStock <= 5;

  const addToBagButton = (
    <Button
      size="lg"
      variant={isBuildable ? "outline" : "default"}
      className="flex-1 w-full min-w-0 rounded-full h-14 text-sm sm:text-base font-semibold transition-all duration-300 px-2 sm:px-4"
      disabled={!inStock || isAddingToCart}
      onClick={handleAddToCart}
    >
      <AnimatePresence mode="wait" initial={false}>
        {addedToCart ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Added to bag
          </motion.span>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">
            {isAddingToCart
              ? "Adding..."
              : inStock
                ? "Add to bag"
                : "Sold out"}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );

  const purchaseActions = (
  <>
    {isBuildable ? (
      <>
        {addToBagButton}
        <Link href={`/customize?product_id=${product.id}`} className="flex-1 w-full min-w-0">
          <Button
            size="lg"
            className="w-full rounded-full h-14 text-sm sm:text-base font-semibold shadow-multi group px-2 sm:px-4"
          >
            <Wand2 className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12 shrink-0" />
            <span className="truncate">Customize</span>
          </Button>
        </Link>
      </>
    ) : (
      addToBagButton
    )}

    <Button
      variant="outline"
      size="lg"
      className="rounded-full h-14 w-[56px] sm:w-[120px] shrink-0 p-0 sm:px-4 flex items-center justify-center"
      onClick={handleShare}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 text-green-600"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Copied</span>
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col min-h-screen bg-background pb-28 lg:pb-20"
    >
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-20 z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg"
      >
        <motion.div
          layout
          className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Shop
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted truncate max-w-[40%]">
            {product.productType}
          </span>
        </motion.div>
      </motion.div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0 lg:gap-16">
        <section className="p-6 lg:p-12 lg:pr-6 flex flex-col items-center lg:items-stretch justify-start lg:sticky lg:top-[8.5rem] lg:self-start">
          <ImageGallery
            product={product}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            slideDirection={slideDirection}
            setSlideDirection={setSlideDirection}
          />
        </section>

        <section className="p-6 lg:p-12 lg:pl-0 flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-[8.5rem]"
          >
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-primary/15">
                {product.productType}
              </span>
              {isBuildable && (
                <span className="inline-flex items-center gap-1 rounded-full bg-section text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-border">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Customizable
                </span>
              )}
              {lowStock && (
                <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 animate-pulse">
                  Only {product.availableStock} left
                </span>
              )}
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] text-foreground font-light leading-[1.05] mb-5">
              {product.name}
            </h1>

            <motion.p
              layout
              className="text-3xl sm:text-4xl font-medium text-primary mb-8 tabular-nums"
            >
              {formatMoney(product.basePriceCents, product.currencyCode)}
            </motion.p>

            <motion.div layout className="h-px w-full bg-border mb-8" />

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-[520px] mb-10">
              {product.description ||
                "A unique piece handcrafted from premium upcycled denim — cut, stitched, and finished to be your next everyday carry."}
            </p>

            {/* Detail cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {[
                {
                  icon: Leaf,
                  label: "Material",
                  value: "Upcycled denim",
                },
                {
                  icon: Package,
                  label: "Availability",
                  value: inStock
                    ? `${product.availableStock} in stock`
                    : "Out of stock",
                  accent: !inStock,
                },
                {
                  icon: CheckCircle2,
                  label: "Status",
                  value: product.isActive ? "Active listing" : "Unavailable",
                },
                {
                  icon: Sparkles,
                  label: "Type",
                  value: isBuildable
                    ? "Build your own"
                    : "Ready to ship",
                },
              ].map((detail, i) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-section/50 p-4 hover:border-primary/20 hover:bg-section transition-colors duration-300"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-border/60 text-primary">
                    <detail.icon className="w-4 h-4" />
                  </span>
                  <motion.div layout>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-0.5">
                      {detail.label}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        detail.accent ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {detail.value}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex flex-row gap-4 w-full">
              {purchaseActions}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Mobile sticky purchase bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 28 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 safe-area-pb shadow-[0_-8px_32px_rgba(0,0,0,0.08)]"
      >
        <motion.div layout className="flex gap-3 max-w-lg mx-auto">
          {purchaseActions}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
            Loading
          </p>
        </div>
      }
    >
      <ProductViewContent />
    </Suspense>
  );
}
