import type { PlacedPatch } from "@/store/useBuilderStore";

const STORAGE_KEY = "highkey_builder_session_v1";

export type BuilderSession = {
  baseProductId: string;
  placedPatches: PlacedPatch[];
  canvasWidthMm: number;
  canvasHeightMm: number;
};

export function saveBuilderSession(session: BuilderSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadBuilderSession(): BuilderSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BuilderSession;
  } catch {
    return null;
  }
}

export function clearBuilderSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function buildCustomizationMeta(
  session: BuilderSession,
  canvasWidthPx: number,
  canvasHeightPx: number
): Record<string, string | number | boolean> {
  const meta: Record<string, string | number | boolean> = {
    canvas_width_mm: session.canvasWidthMm,
    canvas_height_mm: session.canvasHeightMm,
    is_customised: session.placedPatches.length > 0,
  };

  session.placedPatches.forEach((patch, index) => {
    const xRatio = canvasWidthPx > 0 ? patch.x / canvasWidthPx : 0;
    const yRatio = canvasHeightPx > 0 ? patch.y / canvasHeightPx : 0;
    meta[`patch_${index}_id`] = patch.productId;
    meta[`patch_${index}_x`] = Math.round(xRatio * session.canvasWidthMm);
    meta[`patch_${index}_y`] = Math.round(yRatio * session.canvasHeightMm);
    if (index > 0) {
      meta[`patch_${index}_layer`] = index;
      meta[`patch_${index}_rot`] = 0;
    }
  });

  return meta;
}

export function toSessionFulfillmentMethod(
  method: "self_collect" | "delivery" | "road_show"
): "self collect" | "delivery" | "roadshow" {
  if (method === "self_collect") return "self collect";
  if (method === "road_show") return "roadshow";
  return "delivery";
}
