"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  AlertCircle,
  Package,
  Wand2,
  Plus,
  X,
  Check,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProduct, listProducts, getCustomisationTemplates } from "@/lib/api/storefront";
import { StorefrontApiError } from "@/lib/api/client";
import type { Product } from "@/lib/types/storefront";
import { formatMoney } from "@/lib/format";
import { cartEngine } from "@/app/utils/cartEngine";

// --- Types ---

type PlacedPatch = {
  id: string; // unique instance ID
  product: Product;
  x: number; // center X in mm
  y: number; // center Y in mm
  w: number; // width in mm
  h: number; // height in mm
  rot?: number; // rotation in degrees
};

// --- Helpers ---

function getPatchDims(p: Product) {
  return {
    w: Math.max(1, p.dimensions?.maxWidthMm ?? 10),
    h: Math.max(1, p.dimensions?.maxHeightMm ?? 10),
  };
}

function isValidPlacement(
  cx: number,
  cy: number,
  w: number,
  h: number,
  maxW: number,
  maxH: number,
  otherPatches: PlacedPatch[],
  ignoreId?: string
) {
  // Center point must remain within bounds
  if (cx < 0 || cx > maxW || cy < 0 || cy > maxH) return false;

  const left = cx - w / 2;
  const right = cx + w / 2;
  const top = cy - h / 2;
  const bottom = cy + h / 2;

  // Collision with other patches
  for (const p of otherPatches) {
    if (p.id === ignoreId) continue;
    const pLeft = p.x - p.w / 2;
    const pRight = p.x + p.w / 2;
    const pTop = p.y - p.h / 2;
    const pBottom = p.y + p.h / 2;

    const intersect = !(
      left >= pRight ||
      right <= pLeft ||
      top >= pBottom ||
      bottom <= pTop
    );
    if (intersect) return false;
  }

  return true;
}

// --- Canvas Component ---

function ProductCanvas({
  product,
  placedPatches,
  setPlacedPatches,
  onPlacementError,
  maxPatchesLimit,
  customisationUrls = {},
}: {
  product: Product;
  placedPatches: PlacedPatch[];
  setPlacedPatches: React.Dispatch<React.SetStateAction<PlacedPatch[]>>;
  onPlacementError: (msg: string) => void;
  maxPatchesLimit: number;
  customisationUrls?: Record<string, string>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDraggingState, setIsDraggingState] = useState<string | null>(null);
  const [selectedPatchId, setSelectedPatchId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const dragState = useRef({ id: null as string | null, offsetX: 0, offsetY: 0 });

  const dims = product.dimensions;
  const maxW = dims?.maxWidthMm ?? 0;
  const maxH = dims?.maxHeightMm ?? 0;
  const PADDING = 20;

  // SVG viewBox covers the base + padding
  const vBoxX = -PADDING;
  const vBoxY = -PADDING;
  const vBoxW = maxW + PADDING * 2;
  const vBoxH = maxH + PADDING * 2;

  const BASE_PX_PER_MM = 3;
  const pixelWidth = vBoxW * BASE_PX_PER_MM * zoomScale;
  const pixelHeight = vBoxH * BASE_PX_PER_MM * zoomScale;

  const PRIMARY = "var(--color-primary)";
  const MUTED = "var(--color-muted)";
  const BG = "var(--color-background)";
  const FG = "var(--color-foreground)";

  // HTML5 Drop Handler (for dropping from the dock)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!svgRef.current) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data.productId) return;

      if (placedPatches.length >= maxPatchesLimit) {
        onPlacementError(`You can only place up to ${maxPatchesLimit} patches.`);
        return;
      }

      // Calculate drop coordinates in SVG viewBox space
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      let cx = svgP.x;
      let cy = svgP.y;
      const w = data.w;
      const h = data.h;

      // Snap center to bounds if it's slightly outside but dropped near
      cx = Math.max(0, Math.min(maxW, cx));
      cy = Math.max(0, Math.min(maxH, cy));

      if (isValidPlacement(cx, cy, w, h, maxW, maxH, placedPatches)) {
        setPlacedPatches((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            product: data.product,
            x: cx,
            y: cy,
            w,
            h,
            rot: 0,
          },
        ]);
      } else {
        onPlacementError("Invalid placement! Patches cannot overlap.");
      }
    } catch (err) {
      // ignore
    }
  };

  // Pointer Handlers for dragging existing patches
  const handlePointerDown = (
    e: React.PointerEvent,
    patch: PlacedPatch
  ) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    dragState.current = { id: patch.id, offsetX: svgP.x - patch.x, offsetY: svgP.y - patch.y };
    setIsDraggingState(patch.id);
    setSelectedPatchId(patch.id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const draggingId = dragState.current.id;
    if (!draggingId || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const patch = placedPatches.find((p) => p.id === draggingId);
    if (!patch) return;

    let nx = svgP.x - dragState.current.offsetX;
    let ny = svgP.y - dragState.current.offsetY;

    // Constrain center
    nx = Math.max(0, Math.min(maxW, nx));
    ny = Math.max(0, Math.min(maxH, ny));

    // Collision check
    if (isValidPlacement(nx, ny, patch.w, patch.h, maxW, maxH, placedPatches, patch.id)) {
      setPlacedPatches((prev) =>
        prev.map((p) => (p.id === draggingId ? { ...p, x: nx, y: ny } : p))
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState.current.id) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore if not captured
      }
      dragState.current = { id: null, offsetX: 0, offsetY: 0 };
    }
    setIsDraggingState(null);
  };

  const selectedPatch = placedPatches.find(p => p.id === selectedPatchId);

  return (
    <div
      className="relative w-full h-full bg-[#f0ece6] rounded-3xl border border-[#e2ddd8] overflow-hidden select-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="w-full h-full overflow-auto flex" onPointerDown={() => setSelectedPatchId(null)}>
        <div className="m-auto min-w-max min-h-max p-4 md:p-8 flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox={`${vBoxX} ${vBoxY} ${vBoxW} ${vBoxH}`}
            style={{ width: pixelWidth, height: pixelHeight }}
            className="max-w-none max-h-none drop-shadow-sm"
          >
        {/* Base Outline representing build area */}
        <rect
          x={0}
          y={0}
          width={maxW}
          height={maxH}
          rx={6}
          style={{
            fill: "rgba(255,255,255,0.6)",
            stroke: PRIMARY,
            strokeWidth: 0.5,
            strokeDasharray: "2 2",
          }}
        />

        {/* Width Dimension Line (top) */}
        {maxW > 0 && (
          <g>
            <line x1={0} y1={-8} x2={maxW} y2={-8} stroke={MUTED} strokeWidth={0.5} />
            <line x1={0} y1={-11} x2={0} y2={-5} stroke={MUTED} strokeWidth={0.5} />
            <line x1={maxW} y1={-11} x2={maxW} y2={-5} stroke={MUTED} strokeWidth={0.5} />
            <text
              x={maxW / 2}
              y={-12}
              fill={MUTED}
              fontSize="6px"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {maxW} mm
            </text>
          </g>
        )}

        {/* Height Dimension Line (left) */}
        {maxH > 0 && (
          <g>
            <line x1={-8} y1={0} x2={-8} y2={maxH} stroke={MUTED} strokeWidth={0.5} />
            <line x1={-11} y1={0} x2={-5} y2={0} stroke={MUTED} strokeWidth={0.5} />
            <line x1={-11} y1={maxH} x2={-5} y2={maxH} stroke={MUTED} strokeWidth={0.5} />
            <text
              x={-12}
              y={maxH / 2}
              fill={MUTED}
              fontSize="6px"
              fontFamily="monospace"
              textAnchor="middle"
              transform={`rotate(-90, -12, ${maxH / 2})`}
            >
              {maxH} mm
            </text>
          </g>
        )}

        {/* Placed Patches */}
        <AnimatePresence>
          {placedPatches.map((p) => {
            const isSel = selectedPatchId === p.id;
            const isDragging = isDraggingState === p.id;
            const customisationImg = customisationUrls[p.product.id];
            const imgHref = customisationImg || p.product.imageIds?.[0];

            return (
              <motion.g
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: isSel ? 1.05 : 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ 
                  cursor: isDragging ? "grabbing" : "grab", 
                  touchAction: "none",
                  transformOrigin: `${p.x}px ${p.y}px`
                }}
              >
                <g 
                  transform={`rotate(${p.rot || 0}, ${p.x}, ${p.y})`}
                  onPointerDown={(e: any) => handlePointerDown(e, p)}
                >
                  {/* Invisible hit area to capture pointer events but avoid native image dragging */}
                  <rect
                    x={p.x - p.w / 2}
                    y={p.y - p.h / 2}
                    width={p.w}
                    height={p.h}
                    fill="transparent"
                    style={{ pointerEvents: "all" }}
                  />

                  {/* Image or Placeholder */}
                  {imgHref ? (
                    <image
                      href={imgHref}
                      x={p.x - p.w / 2}
                      y={p.y - p.h / 2}
                      width={p.w}
                      height={p.h}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ pointerEvents: "none" }}
                    />
                  ) : (
                    <rect
                      x={p.x - p.w / 2}
                      y={p.y - p.h / 2}
                      width={p.w}
                      height={p.h}
                      rx={2}
                      style={{ fill: BG, stroke: FG, strokeWidth: 0.5, pointerEvents: "none" }}
                    />
                  )}

                  {/* Highlight box */}
                  <rect
                    x={p.x - p.w / 2}
                    y={p.y - p.h / 2}
                    width={p.w}
                    height={p.h}
                    rx={2}
                    style={{
                      fill: "transparent",
                      stroke: isSel ? PRIMARY : "rgba(255,255,255,0.4)",
                      strokeWidth: isSel ? 1 : 0.5,
                      strokeDasharray: isSel ? "none" : "1 1",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Delete button (small circle) */}
                  <g
                    transform={`translate(${p.x + p.w / 2 + 4}, ${p.y - p.h / 2 - 4})`}
                    style={{ cursor: "pointer", pointerEvents: "auto" }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlacedPatches((prev) => prev.filter((patch) => patch.id !== p.id));
                    }}
                  >
                    <circle cx={0} cy={0} r={4} fill="var(--color-destructive)" />
                    <line x1={-1.5} y1={-1.5} x2={1.5} y2={1.5} stroke="white" strokeWidth={1} />
                    <line x1={-1.5} y1={1.5} x2={1.5} y2={-1.5} stroke="white" strokeWidth={1} />
                  </g>
                </g>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 left-6 flex items-center gap-1 bg-background/90 backdrop-blur-md px-2 py-1.5 rounded-full border border-border shadow-sm pointer-events-auto">
        <button
          onClick={() => setZoomScale(s => Math.max(0.25, s - 0.25))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors"
        >
          <span className="text-xl font-medium leading-none mb-0.5">-</span>
        </button>
        <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded">
          <input
            type="number"
            min="10"
            max="1000"
            value={Math.round(zoomScale * 100)}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                setZoomScale(Math.max(0.1, Math.min(10, val / 100)));
              }
            }}
            className="w-10 bg-transparent text-center text-xs font-mono font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded p-0 border border-border"
          />
          <span className="text-xs font-mono font-semibold text-muted-foreground">%</span>
        </div>
        <button
          onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors"
        >
          <span className="text-xl font-medium leading-none mb-0.5">+</span>
        </button>
      </div>

      {/* Rotation Slider */}
      <AnimatePresence>
        {selectedPatch && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-6 left-1/2 z-10 flex items-center gap-3 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm pointer-events-auto"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rotate</span>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedPatch.rot || 0}
              onChange={(e) => {
                const newRot = parseInt(e.target.value);
                setPlacedPatches(prev =>
                  prev.map(p => (p.id === selectedPatchId ? { ...p, rot: newRot } : p))
                );
              }}
              className="w-32 md:w-48 accent-primary h-1 bg-muted rounded-full appearance-none outline-none"
            />
            <span className="text-xs font-mono font-semibold w-8 text-right">{selectedPatch.rot || 0}°</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Content ---

function CustomizeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const productId = params.get("product_id");
  const cartItemId = params.get("cart_item_id");

  const [product, setProduct] = useState<Product | null>(null);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog & Selection State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogSearch, setDialogSearch] = useState("");
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());
  const [confirmedSelectedIds, setConfirmedSelectedIds] = useState<Set<string>>(new Set());

  // Placed patches on canvas
  const [placedPatches, setPlacedPatches] = useState<PlacedPatch[]>([]);
  const [customisationUrls, setCustomisationUrls] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ id: number; text: string } | null>(null);
  const showToast = (text: string) => {
    const id = Date.now();
    setToastMessage({ id, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    if (!productId) {
      setError("No product ID provided.");
      setLoading(false);
      return;
    }
    
    Promise.all([
      getProduct(productId),
      listProducts({ type: "accessory", limit: 100, page: 1 }),
      cartItemId ? cartEngine.getAllItems() : Promise.resolve([])
    ])
      .then(async ([baseProduct, accResponse, cartItems]) => {
        setProduct(baseProduct);
        const activeAccs = accResponse.data.filter((a) => a.isActive);
        setAccessories(activeAccs);

        // Fetch customisation templates for each active accessory to get the resolved URLs
        const templateUrls: Record<string, string> = {};
        await Promise.all(
          activeAccs.map(async (acc) => {
            if (acc.customisationImageIds && acc.customisationImageIds.length > 0) {
              try {
                const res = await getCustomisationTemplates(acc.id);
                const templateImg = res.images.find(img => img.id === acc.customisationImageIds?.[0]);
                if (templateImg) {
                  templateUrls[acc.id] = templateImg.url;
                }
              } catch (e) {
                // Ignore errors
              }
            }
          })
        );
        setCustomisationUrls(templateUrls);

        if (cartItemId && cartItems.length > 0) {
          const item = cartItems.find((i) => i.cart_item_id === cartItemId);
          if (item && item.customizationMeta) {
            const meta = item.customizationMeta;
            const patches: PlacedPatch[] = [];
            const ids = new Set<string>();

            // Reconstruct patches from meta
            for (let i = 0; i < 25; i++) {
              const pId = meta[`patch_${i}_id`] as string;
              if (!pId) break;

              const px = meta[`patch_${i}_x`] as number;
              const py = meta[`patch_${i}_y`] as number;
              const prot = Number(meta[`patch_${i}_rot`] ?? 0);

              const accProduct = activeAccs.find((a) => a.id === pId);
              if (accProduct) {
                patches.push({
                  id: crypto.randomUUID(),
                  product: accProduct,
                  x: px,
                  y: py,
                  ...getPatchDims(accProduct),
                  rot: prot,
                });
                ids.add(pId);
              }
            }

            setPlacedPatches(patches);
            setConfirmedSelectedIds(ids);
          }
        }
      })
      .catch((err) =>
        setError(err instanceof StorefrontApiError ? err.message : "Failed to load data.")
      )
      .finally(() => setLoading(false));
  }, [productId, cartItemId]);

  // Handle open dialog
  const handleOpenDialog = () => {
    setTempSelectedIds(new Set(confirmedSelectedIds));
    setIsDialogOpen(true);
  };

  // Handle confirm dialog
  const handleConfirmDialog = () => {
    setConfirmedSelectedIds(new Set(tempSelectedIds));
    setIsDialogOpen(false);
  };

  const toggleAccessorySelection = (id: string) => {
    const newSet = new Set(tempSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setTempSelectedIds(newSet);
  };

  const handleSave = async () => {
    if (!product) return;
    setIsSaving(true);
    
    try {
      const customizationMeta: Record<string, string | number | boolean> = {
        canvas_width_mm: product.dimensions?.maxWidthMm ?? 0,
        canvas_height_mm: product.dimensions?.maxHeightMm ?? 0,
        is_customised: placedPatches.length > 0,
      };

      const patchesPayload = placedPatches.map((patch, index) => {
        customizationMeta[`patch_${index}_id`] = patch.product.id;
        customizationMeta[`patch_${index}_x`] = Math.round(patch.x);
        customizationMeta[`patch_${index}_y`] = Math.round(patch.y);
        customizationMeta[`patch_${index}_rot`] = patch.rot || 0;
        if (index > 0) {
          customizationMeta[`patch_${index}_layer`] = index;
        }
        return {
          product_id: patch.product.id,
          quantity: 1
        };
      });

      if (cartItemId) {
        await cartEngine.updateCustomizedProduct(cartItemId, product.id, customizationMeta, patchesPayload);
        showToast("Bag updated successfully!");
      } else {
        await cartEngine.addCustomizedProduct(product.id, customizationMeta, patchesPayload);
        showToast("Added to bag successfully!");
      }
      
      setTimeout(() => {
        router.push("/cart");
      }, 500);
    } catch (err) {
      showToast(cartItemId ? "Failed to update bag." : "Failed to save to bag.");
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-3xl font-heading font-light">Product not found</h2>
        <Link href="/shop"><Button variant="outline" className="rounded-full"><ArrowLeft className="mr-2 w-4 h-4" /> Back to shop</Button></Link>
      </div>
    );
  }

  const selectedAccessories = accessories.filter((a) => confirmedSelectedIds.has(a.id));
  const maxPatchesLimit = Math.min(product.dimensions?.maxPatches ?? 25, 25);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100dvh-5rem)] bg-background flex flex-col overflow-hidden">
      
      {/* Top Header */}
      <header className="relative z-50 h-16 shrink-0 border-b border-border/60 bg-background/85 backdrop-blur-lg flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/view?product_id=${productId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/30 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-bold truncate max-w-[200px] sm:max-w-md">{product.name}</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Customization Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleOpenDialog} className="rounded-full shadow-hover">
            <Wand2 className="w-4 h-4 mr-2" />
            Select Patches
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-full shadow-hover px-6 font-semibold"
          >
            {isSaving ? "Saving..." : cartItemId ? "Update Bag" : "Save & Add to Bag"}
          </Button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        
        {/* The 2D Canvas */}
        <div className="flex-1 relative">
          <ProductCanvas product={product} placedPatches={placedPatches} setPlacedPatches={setPlacedPatches} onPlacementError={showToast} maxPatchesLimit={maxPatchesLimit} customisationUrls={customisationUrls} />
          
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                key={toastMessage.id}
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                className="absolute top-4 left-1/2 z-50 flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-3 rounded-full shadow-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Overlay info */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-sm">
              <p className="text-xs font-bold uppercase text-muted tracking-wider mb-0.5">Dimensions</p>
              <p className="text-sm font-mono font-semibold">{product.dimensions?.maxWidthMm} x {product.dimensions?.maxHeightMm} mm</p>
            </div>
            <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-sm">
              <p className="text-xs font-bold uppercase text-muted tracking-wider mb-0.5">Patches Placed</p>
              <p className="text-sm font-mono font-semibold">{placedPatches.length} / {maxPatchesLimit}</p>
            </div>
          </div>
        </div>

        {/* Drag Source Dock (Bottom on Mobile, Right on Desktop) */}
        <AnimatePresence>
          {selectedAccessories.length > 0 && (
            <motion.aside 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="lg:w-72 bg-surface/80 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-border/60 shrink-0 p-4 lg:p-6 flex flex-col z-10 shadow-multi"
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-4 hidden lg:block">Available Patches</h3>
              <p className="text-xs text-muted mb-6 leading-relaxed hidden lg:block">Drag and drop these patches onto your canvas, or tap them to place.</p>
              <div className="flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden flex flex-row lg:flex-col gap-4 pb-4 lg:pb-0 items-start">
                {selectedAccessories.map((patch) => {
                  const dims = getPatchDims(patch);
                  return (
                    <div
                      key={patch.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({
                          productId: patch.id,
                          product: patch,
                          w: dims.w,
                          h: dims.h,
                        }));
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => {
                        if (placedPatches.length >= maxPatchesLimit) {
                          showToast(`You can only place up to ${maxPatchesLimit} patches.`);
                          return;
                        }

                        let cx = (product?.dimensions?.maxWidthMm ?? 10) / 2;
                        let cy = (product?.dimensions?.maxHeightMm ?? 10) / 2;
                        
                        let foundSpot = false;
                        for (let dx = -20; dx <= 20; dx += 10) {
                          for (let dy = -20; dy <= 20; dy += 10) {
                            if (isValidPlacement(cx + dx, cy + dy, dims.w, dims.h, product?.dimensions?.maxWidthMm ?? 0, product?.dimensions?.maxHeightMm ?? 0, placedPatches)) {
                              cx += dx;
                              cy += dy;
                              foundSpot = true;
                              break;
                            }
                          }
                          if (foundSpot) break;
                        }

                        if (foundSpot || isValidPlacement(cx, cy, dims.w, dims.h, product?.dimensions?.maxWidthMm ?? 0, product?.dimensions?.maxHeightMm ?? 0, placedPatches)) {
                          setPlacedPatches((prev) => [
                            ...prev,
                            {
                              id: crypto.randomUUID(),
                              product: patch,
                              x: cx,
                              y: cy,
                              w: dims.w,
                              h: dims.h,
                            },
                          ]);
                        } else {
                          showToast("No space to place patch near center. Try moving other patches first.");
                        }
                      }}
                      className="shrink-0 w-24 lg:w-full bg-background rounded-2xl border border-border/80 p-3 flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm"
                    >
                      <div className="w-12 h-12 relative flex items-center justify-center">
                        {patch.imageIds?.[0] ? (
                          <Image src={patch.imageIds[0]} alt={patch.name} fill className="object-contain" unoptimized />
                        ) : (
                          <Package className="w-6 h-6 text-muted" />
                        )}
                      </div>
                      <div className="text-center w-full">
                        <p className="text-[11px] font-bold truncate" title={patch.name}>{patch.name}</p>
                        <p className="text-[10px] text-primary mt-0.5">{formatMoney(patch.basePriceCents, patch.currencyCode)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Select Patches Full-Screen Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0, y: "10%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "10%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col"
          >
            <div className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0 bg-background">
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="font-heading text-lg font-bold">Select Accessories</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted font-bold">{tempSelectedIds.size} selected</span>
                <Button type="button" onClick={handleConfirmDialog} className="rounded-full shadow-hover">
                  Confirm
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-12">
              <div className="max-w-6xl mx-auto">
                <div className="relative mb-8 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search patches..."
                    value={dialogSearch}
                    onChange={(e) => setDialogSearch(e.target.value)}
                    className="w-full bg-surface border border-border rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {accessories
                    .filter((a) => a.name.toLowerCase().includes(dialogSearch.toLowerCase()))
                    .map((acc) => {
                      const isSelected = tempSelectedIds.has(acc.id);
                      return (
                        <div
                          key={acc.id}
                          onClick={() => toggleAccessorySelection(acc.id)}
                          className={`relative group cursor-pointer rounded-[24px] border-2 transition-all duration-300 p-4 flex flex-col items-center gap-4 bg-surface hover:shadow-md ${
                            isSelected ? "border-primary shadow-sm scale-[0.98]" : "border-border/50 hover:border-border"
                          }`}
                        >
                          <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-background border border-border/80 text-transparent"
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-16 h-16 relative flex items-center justify-center mt-2">
                            {acc.imageIds?.[0] ? (
                              <Image src={acc.imageIds[0]} alt={acc.name} fill className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" unoptimized />
                            ) : (
                              <Package className="w-8 h-8 text-muted/50" />
                            )}
                          </div>
                          <div className="text-center w-full mt-auto">
                            <p className="text-xs font-bold leading-tight line-clamp-2 min-h-[2.5em]">{acc.name}</p>
                            <p className="text-[11px] text-muted mt-1">{formatMoney(acc.basePriceCents, acc.currencyCode)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Page Export ---

export default function CustomizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CustomizeContent />
    </Suspense>
  );
}
