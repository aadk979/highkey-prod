"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Undo2, Redo2, Package, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useBuilderStore } from "@/store/useBuilderStore";
import { getProduct, listProducts } from "@/lib/api/storefront";
import { formatMoney, mmToCm } from "@/lib/format";
import type { Product } from "@/lib/types/storefront";
import { cartEngine } from "@/app/utils/cartEngine";
import { saveBuilderSession } from "@/lib/builderSession";
import { notifyCartUpdated } from "@/hooks/useCartCount";

const DENIM_COLORS: Record<
  string,
  { bg: string; border: string; line: string }
> = {
  midnight_blue: {
    bg: "#1e293b",
    border: "#0f172a",
    line: "rgba(255,255,255,0.1)",
  },
  sky_blue: {
    bg: "#7dd3fc",
    border: "#38bdf8",
    line: "rgba(255,255,255,0.3)",
  },
  classic_blue: {
    bg: "#1d4ed8",
    border: "#1e3a8a",
    line: "rgba(255,255,255,0.15)",
  },
  indigo_blue: {
    bg: "#312e81",
    border: "#1e1b4b",
    line: "rgba(255,255,255,0.1)",
  },
  light_steel_blue: {
    bg: "#cbd5e1",
    border: "#94a3b8",
    line: "rgba(255,255,255,0.4)",
  },
};

type DragPayload = {
  productId: string;
  name: string;
  priceCents: number;
  wCm: number;
  hCm: number;
};

type AccessoryPatch = {
  product: Product;
  wCm: number;
  hCm: number;
};

function patchSizeFromProduct(product: Product): { wCm: number; hCm: number } {
  const d = product.dimensions;
  if (d) {
    return {
      wCm: Math.max(1, mmToCm(d.maxWidthMm)),
      hCm: Math.max(1, mmToCm(d.maxHeightMm)),
    };
  }
  return { wCm: 1, hCm: 1 };
}

function DenimGrid({
  widthCm,
  heightCm,
  colorKey,
  shaking,
  cellPx,
  children,
  canvasRef,
  onDragOver,
  onDrop,
  onDragLeave,
}: {
  widthCm: number;
  heightCm: number;
  colorKey: string;
  shaking: boolean;
  cellPx: number;
  children: React.ReactNode;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
}) {
  const colors = DENIM_COLORS[colorKey] ?? DENIM_COLORS.classic_blue;
  const wPx = widthCm * cellPx;
  const hPx = heightCm * cellPx;

  return (
    <motion.div
      ref={canvasRef as React.RefObject<HTMLDivElement>}
      animate={{
        x: shaking ? [-6, 6, -6, 6, -3, 3, 0] : 0,
        scale: shaking ? [1, 1.01, 1] : 1,
      }}
      transition={{ duration: shaking ? 0.35 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className="relative select-none rounded-[8px] sm:rounded-[16px] mx-auto shadow-hover"
      style={{
        width: wPx,
        height: hPx,
        background: colors.bg,
        border: `3px solid ${colors.border}`,
        overflow: "hidden",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/denim.png')",
        }}
      />
      <svg className="absolute inset-0 pointer-events-none" width={wPx} height={hPx}>
        {Array.from({ length: widthCm + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * cellPx}
            y1={0}
            x2={i * cellPx}
            y2={hPx}
            stroke={colors.line}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
        {Array.from({ length: heightCm + 1 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * cellPx}
            x2={wPx}
            y2={i * cellPx}
            stroke={colors.line}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
      </svg>
      {children}
    </motion.div>
  );
}

function BuilderContent() {
  const params = useSearchParams();
  const router = useRouter();
  const productId = params.get("product_id");

  const {
    activeBase,
    setActiveBase,
    placedPatches,
    addPatch,
    removePatch,
    updatePatchPosition,
    undo,
    redo,
    reset,
    historyIndex,
    history,
  } = useBuilderStore();

  const [accessories, setAccessories] = useState<AccessoryPatch[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [dropHovering, setDropHovering] = useState(false);
  const [cellPx, setCellPx] = useState(55);
  const [adding, setAdding] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    async function load() {
      if (!productId) {
        setLoadError("No base product selected.");
        return;
      }
      try {
        const [base, accessoryList] = await Promise.all([
          getProduct(productId),
          listProducts({ type: "accessory", limit: 100, page: 1 }),
        ]);
        if (base.productType !== "base" || !base.isCustomizable) {
          setLoadError("This product cannot be customized.");
          return;
        }
        setActiveBase(base);
        setAccessories(
          accessoryList.data
            .filter((p) => p.isActive && p.availableStock > 0)
            .map((product) => ({
              product,
              ...patchSizeFromProduct(product),
            }))
        );
      } catch {
        setLoadError("Could not load builder. Please try again.");
      }
    }
    load();
  }, [productId, setActiveBase]);

  const filteredPatches = accessories.filter((p) =>
    p.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (listRef.current) {
      setShowScrollIndicator(
        listRef.current.scrollHeight > listRef.current.clientHeight
      );
    }
  }, [filteredPatches]);

  useEffect(() => {
    if (!activeBase) return;
    const updateScale = () => {
      const hCm = mmToCm(activeBase.dimensions.maxHeightMm);
      const maxH = window.innerHeight * 0.65;
      setCellPx(Math.max(30, Math.min(85, maxH / hCm)));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [activeBase]);

  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <p className="text-muted">{loadError}</p>
        <Link href="/shop">
          <Button variant="outline" className="rounded-full">
            Back to Shop
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (!activeBase) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-20 text-muted">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const canvasWidthCm = mmToCm(activeBase.dimensions.maxWidthMm);
  const canvasHeightCm = mmToCm(activeBase.dimensions.maxHeightMm);
  const canvasWidthPx = canvasWidthCm * cellPx;
  const canvasHeightPx = canvasHeightCm * cellPx;
  const freeCount = activeBase.dimensions.maxPatches;

  const paidPatchesCents = placedPatches.reduce((sum, p, i) => {
    if (i >= freeCount) return sum + p.priceCents;
    return sum;
  }, 0);
  const totalCents = activeBase.basePriceCents + paidPatchesCents;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const handleDragStart = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropHovering(false);
    if (!canvasRef.current) return;

    let payload: DragPayload;
    try {
      payload = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;
    const patchWPx = payload.wCm * cellPx;
    const patchHPx = payload.hCm * cellPx;
    const cx = Math.max(
      patchWPx / 2,
      Math.min(canvasWidthPx - patchWPx / 2, dropX)
    );
    const cy = Math.max(
      patchHPx / 2,
      Math.min(canvasHeightPx - patchHPx / 2, dropY)
    );

    for (const ep of placedPatches) {
      const epW = ep.wCm * cellPx;
      const epH = ep.hCm * cellPx;
      const eL = ep.x - epW / 2;
      const eR = ep.x + epW / 2;
      const eT = ep.y - epH / 2;
      const eB = ep.y + epH / 2;
      const newL = cx - patchWPx / 2;
      const newR = cx + patchWPx / 2;
      const newT = cy - patchHPx / 2;
      const newB = cy + patchHPx / 2;
      if (!(newL >= eR || newR <= eL || newT >= eB || newB <= eT)) {
        triggerShake();
        return;
      }
    }

    addPatch({
      productId: payload.productId,
      name: payload.name,
      priceCents: payload.priceCents,
      wCm: payload.wCm,
      hCm: payload.hCm,
      x: cx,
      y: cy,
    });
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await cartEngine.addItem(activeBase.id, 1);
      saveBuilderSession({
        baseProductId: activeBase.id,
        placedPatches,
        canvasWidthMm: activeBase.dimensions.maxWidthMm,
        canvasHeightMm: activeBase.dimensions.maxHeightMm,
      });
      notifyCartUpdated();
      router.push("/cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="flex md:hidden flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background border-t border-border">
        <h2 className="font-heading font-bold text-2xl mb-3 text-foreground">
          Desktop Experience
        </h2>
        <p className="text-muted text-sm max-w-[280px] mx-auto leading-relaxed mb-6">
          Customize your keychain on a larger screen for precise patch placement.
        </p>
        <Link href="/shop">
          <Button variant="outline" className="rounded-full">
            Return to Shop
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden md:flex flex-row w-full overflow-hidden bg-section"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <div className="w-[320px] h-full flex flex-col bg-background border-r border-border shrink-0 z-20">
          <div className="p-4 border-b border-border">
            <input
              type="text"
              placeholder="Search patches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={listRef}
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                setShowScrollIndicator(
                  scrollHeight - scrollTop > clientHeight + 10
                );
              }}
              className="h-full overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start pb-20"
            >
              {filteredPatches.length === 0 ? (
                <p className="col-span-2 text-center text-muted text-sm pt-8">
                  No patches found.
                </p>
              ) : (
                filteredPatches.map(({ product, wCm, hCm }) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -2 }}
                    className="bg-card border border-border rounded-lg p-2 flex flex-col gap-2 hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      className="w-full flex flex-col items-center justify-center text-center min-h-[64px] bg-surface border-2 border-dashed border-border"
                      style={{ aspectRatio: wCm / hCm }}
                    >
                      <div
                        draggable
                        onDragStart={(e: React.DragEvent) =>
                          handleDragStart(e, {
                            productId: product.id,
                            name: product.name,
                            priceCents: product.basePriceCents,
                            wCm,
                            hCm,
                          })
                        }
                        className="w-full h-full flex flex-col items-center justify-center"
                      >
                      {product.imageIds[0] ? (
                        <Image
                          src={product.imageIds[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-contain mb-1"
                          unoptimized
                        />
                      ) : null}
                      <span className="text-[10px] font-bold leading-tight px-1">
                        {product.name}
                      </span>
                      </div>
                    </motion.div>
                    <div className="flex justify-between items-center px-1 text-[10px]">
                      <span className="text-muted truncate">{product.name}</span>
                      <span
                        className={`font-bold ${placedPatches.length < freeCount ? "text-green-600" : "text-primary"}`}
                      >
                        {placedPatches.length < freeCount
                          ? "FREE"
                          : formatMoney(
                              product.basePriceCents,
                              product.currencyCode
                            )}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <AnimatePresence>
              {showScrollIndicator && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-2"
                >
                  <ChevronDown size={14} className="opacity-60" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 h-full relative flex flex-col items-center justify-center bg-section overflow-hidden">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 py-2.5 px-6 rounded-full border border-border bg-background/80 backdrop-blur-md shadow-sm z-10 text-sm">
            <span className="font-heading font-bold uppercase tracking-wider">
              {activeBase.name}
            </span>
            <span className="text-muted font-mono">
              {canvasWidthCm}×{canvasHeightCm}cm
            </span>
            <button
              onClick={reset}
              className="font-bold text-primary hover:text-foreground uppercase text-xs tracking-wider"
            >
              Reset
            </button>
          </div>

          <DenimGrid
            widthCm={canvasWidthCm}
            heightCm={canvasHeightCm}
            colorKey={activeBase.colorKey}
            shaking={isShaking}
            cellPx={cellPx}
            canvasRef={canvasRef}
            onDragOver={(e) => {
              e.preventDefault();
              setDropHovering(true);
            }}
            onDrop={handleDrop}
            onDragLeave={() => setDropHovering(false)}
          >
            {dropHovering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-primary/10 pointer-events-none"
              />
            )}
            <AnimatePresence>
              {placedPatches.map((patch) => (
                <PlacedPatchBox
                  key={patch.id}
                  patch={patch}
                  cellPx={cellPx}
                  canvasRef={canvasRef}
                  onRemove={removePatch}
                  onUpdatePos={updatePatchPosition}
                />
              ))}
            </AnimatePresence>
          </DenimGrid>
        </div>

        <div className="w-[320px] h-full flex flex-col bg-background border-l border-border shrink-0">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-heading font-bold uppercase tracking-wider text-sm">
              Summary
            </h3>
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-1.5 rounded bg-surface disabled:opacity-30"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-1.5 rounded bg-surface disabled:opacity-30"
              >
                <Redo2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
            <motion.div layout className="border-b border-border pb-4">
              <span className="text-muted text-xs uppercase tracking-widest font-bold">
                Base
              </span>
              <motion.div layout className="flex justify-between mt-1">
                <p className="font-bold">{activeBase.name}</p>
                <p className="font-bold">
                  {formatMoney(
                    activeBase.basePriceCents,
                    activeBase.currencyCode
                  )}
                </p>
              </motion.div>
            </motion.div>

            {placedPatches.length > 0 ? (
              placedPatches.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  className="flex justify-between text-sm gap-2"
                >
                  <span className="truncate">- {p.name}</span>
                  <span
                    className={
                      i < freeCount ? "text-green-600 font-bold" : "text-primary font-bold"
                    }
                  >
                    {i < freeCount
                      ? "FREE"
                      : `+${formatMoney(p.priceCents, activeBase.currencyCode)}`}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-muted opacity-60">
                <Package size={24} />
                <span className="text-xs uppercase tracking-wider">
                  Empty Canvas
                </span>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-border bg-surface/50 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-xs uppercase font-bold text-muted">Total</span>
              <span className="font-heading font-bold text-4xl">
                {formatMoney(totalCents, activeBase.currencyCode)}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full rounded-full shadow-hover"
              disabled={adding}
              onClick={handleAddToCart}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function PlacedPatchBox({
  patch,
  cellPx,
  canvasRef,
  onRemove,
  onUpdatePos,
}: {
  patch: {
    id: string;
    name: string;
    x: number;
    y: number;
    wCm: number;
    hCm: number;
  };
  cellPx: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onRemove: (id: string) => void;
  onUpdatePos: (id: string, x: number, y: number) => void;
}) {
  const wPx = patch.wCm * cellPx;
  const hPx = patch.hCm * cellPx;
  const offset = useRef({ ox: 0, oy: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    offset.current = {
      ox: e.clientX - (rect.left + patch.x),
      oy: e.clientY - (rect.top + patch.y),
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (!canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const nx = ev.clientX - r.left - offset.current.ox;
      const ny = ev.clientY - r.top - offset.current.oy;
      onUpdatePos(
        patch.id,
        Math.max(wPx / 2, Math.min(r.width - wPx / 2, nx)),
        Math.max(hPx / 2, Math.min(r.height - hPx / 2, ny))
      );
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      onMouseDown={handleMouseDown}
      className="absolute group cursor-move"
      style={{
        width: wPx,
        height: hPx,
        left: patch.x - wPx / 2,
        top: patch.y - hPx / 2,
        zIndex: 20,
      }}
    >
      <div className="w-full h-full bg-background border-[2.5px] border-border shadow-md flex items-center justify-center text-center relative group-hover:border-primary">
        <span className="text-foreground font-bold text-[10px] px-1">
          {patch.name}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(patch.id);
        }}
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 bg-foreground text-background flex items-center justify-center"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[60vh] flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </motion.div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
