export const CUSTOMIZATION_META_SCHEMA_VERSION = 2;
export const CUSTOMIZATION_SIDES = ["front", "back"] as const;

export type CustomizationSide = (typeof CUSTOMIZATION_SIDES)[number];

export type CustomizationMetaPatch = {
  product_id: string;
  x_mm: number;
  y_mm: number;
  width_mm: number;
  height_mm: number;
  rotation_deg: number;
  layer: number;
};

export type CustomizationMeta = {
  customization_schema_version: typeof CUSTOMIZATION_META_SCHEMA_VERSION;
  canvas: {
    width_mm: number;
    height_mm: number;
  };
  is_customised: boolean;
  patch_count: number;
  sides: Record<CustomizationSide, { patches: CustomizationMetaPatch[] }>;
};

type CompactCustomizationPatch = [
  productId: string,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
  rotationDeg: number,
  layer: number,
];

type CompactCustomizationMeta = {
  v: typeof CUSTOMIZATION_META_SCHEMA_VERSION;
  c: [widthMm: number, heightMm: number];
  f: CompactCustomizationPatch[];
  b: CompactCustomizationPatch[];
};

export function isCustomizationMetaV2(
  meta: unknown
): meta is CustomizationMeta {
  return (
    !!meta &&
    typeof meta === "object" &&
    (meta as Record<string, unknown>).customization_schema_version ===
      CUSTOMIZATION_META_SCHEMA_VERSION
  );
}

function isCompactCustomizationMetaV2(
  meta: unknown
): meta is CompactCustomizationMeta {
  if (!meta || typeof meta !== "object") return false;
  const value = meta as Partial<CompactCustomizationMeta>;
  return (
    value.v === CUSTOMIZATION_META_SCHEMA_VERSION &&
    Array.isArray(value.c) &&
    value.c.length === 2 &&
    Array.isArray(value.f) &&
    Array.isArray(value.b) &&
    value.f.every(isCompactCustomizationPatch) &&
    value.b.every(isCompactCustomizationPatch)
  );
}

function isCompactCustomizationPatch(
  patch: unknown
): patch is CompactCustomizationPatch {
  return (
    Array.isArray(patch) &&
    patch.length === 7 &&
    typeof patch[0] === "string" &&
    patch.slice(1).every((value) => typeof value === "number")
  );
}

function patchFromCompact(patch: CompactCustomizationPatch): CustomizationMetaPatch {
  return {
    product_id: String(patch[0]),
    x_mm: Number(patch[1] ?? 0),
    y_mm: Number(patch[2] ?? 0),
    width_mm: Number(patch[3] ?? 1),
    height_mm: Number(patch[4] ?? 1),
    rotation_deg: Number(patch[5] ?? 0),
    layer: Number(patch[6] ?? 0),
  };
}

export function decodeCustomizationMeta(raw: unknown): CustomizationMeta | null {
  if (isCustomizationMetaV2(raw)) return raw;

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!isCompactCustomizationMetaV2(parsed)) return null;

  const front = parsed.f.map(patchFromCompact);
  const back = parsed.b.map(patchFromCompact);

  return {
    customization_schema_version: CUSTOMIZATION_META_SCHEMA_VERSION,
    canvas: {
      width_mm: Number(parsed.c[0] ?? 0),
      height_mm: Number(parsed.c[1] ?? 0),
    },
    is_customised: front.length + back.length > 0,
    patch_count: front.length + back.length,
    sides: {
      front: { patches: front },
      back: { patches: back },
    },
  };
}

export function otherCustomizationSide(
  side: CustomizationSide
): CustomizationSide {
  return side === "front" ? "back" : "front";
}
