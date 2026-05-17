import { Input } from "@/components/ui/input";
import type { ProductDimensions } from "@/lib/types/product";

export interface DimensionFieldValues {
  minWidthMm: string;
  minHeightMm: string;
  maxWidthMm: string;
  maxHeightMm: string;
  maxPatches: string;
}

export function emptyDimensionFields(): DimensionFieldValues {
  return {
    minWidthMm: "",
    minHeightMm: "",
    maxWidthMm: "",
    maxHeightMm: "",
    maxPatches: "",
  };
}

export function dimensionFieldsFromProduct(
  dimensions: ProductDimensions | null | undefined,
): DimensionFieldValues {
  if (!dimensions) return emptyDimensionFields();
  return {
    minWidthMm: dimensions.minWidthMm != null ? String(dimensions.minWidthMm) : "",
    minHeightMm: dimensions.minHeightMm != null ? String(dimensions.minHeightMm) : "",
    maxWidthMm: dimensions.maxWidthMm != null ? String(dimensions.maxWidthMm) : "",
    maxHeightMm: dimensions.maxHeightMm != null ? String(dimensions.maxHeightMm) : "",
    maxPatches: dimensions.maxPatches != null ? String(dimensions.maxPatches) : "",
  };
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const n = parseInt(trimmed, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Returns dimensions object if any field is set; undefined if all empty. */
export function buildDimensionsPayload(
  fields: DimensionFieldValues,
): ProductDimensions | undefined {
  const dimensions: ProductDimensions = {
    minWidthMm: parseOptionalInt(fields.minWidthMm),
    minHeightMm: parseOptionalInt(fields.minHeightMm),
    maxWidthMm: parseOptionalInt(fields.maxWidthMm),
    maxHeightMm: parseOptionalInt(fields.maxHeightMm),
    maxPatches: parseOptionalInt(fields.maxPatches),
  };

  const hasValue = Object.values(dimensions).some((v) => v !== undefined);
  if (!hasValue) return undefined;

  return dimensions;
}

export function hasDimensionFields(fields: DimensionFieldValues): boolean {
  return Object.values(fields).some((v) => v.trim() !== "");
}

interface ProductDimensionsFieldsProps {
  values: DimensionFieldValues;
  onChange: (values: DimensionFieldValues) => void;
}

export function ProductDimensionsFields({
  values,
  onChange,
}: ProductDimensionsFieldsProps) {
  function setField(key: keyof DimensionFieldValues, value: string) {
    onChange({ ...values, [key]: value });
  }

  return (
    <fieldset className="rounded-lg border border-hairline bg-surface-1 p-4">
      <legend className="px-1 text-sm font-medium text-ink">
        Dimensions <span className="font-normal text-ink-subtle">(optional, mm)</span>
      </legend>
      <p className="mb-4 text-xs text-ink-subtle">
        Min/max print area and patch limit for customizable products.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Min width (mm)"
          type="number"
          min="0"
          value={values.minWidthMm}
          onChange={(e) => setField("minWidthMm", e.target.value)}
        />
        <Input
          label="Min height (mm)"
          type="number"
          min="0"
          value={values.minHeightMm}
          onChange={(e) => setField("minHeightMm", e.target.value)}
        />
        <Input
          label="Max width (mm)"
          type="number"
          min="0"
          value={values.maxWidthMm}
          onChange={(e) => setField("maxWidthMm", e.target.value)}
        />
        <Input
          label="Max height (mm)"
          type="number"
          min="0"
          value={values.maxHeightMm}
          onChange={(e) => setField("maxHeightMm", e.target.value)}
        />
        <Input
          label="Max patches"
          type="number"
          min="0"
          className="sm:col-span-2"
          value={values.maxPatches}
          onChange={(e) => setField("maxPatches", e.target.value)}
          hint="Maximum number of patches allowed on this product"
        />
      </div>
    </fieldset>
  );
}
