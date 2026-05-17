import type { ProductDimensions } from "@/lib/types/product";

function formatMm(value: number | undefined): string {
  return value != null ? `${value} mm` : "—";
}

export function ProductDimensionsDisplay({
  dimensions,
}: {
  dimensions: ProductDimensions | null;
}) {
  if (!dimensions) {
    return <p className="text-sm text-ink-subtle">No dimensions set</p>;
  }

  const rows: { label: string; value: string }[] = [
    { label: "Min width", value: formatMm(dimensions.minWidthMm) },
    { label: "Min height", value: formatMm(dimensions.minHeightMm) },
    { label: "Max width", value: formatMm(dimensions.maxWidthMm) },
    { label: "Max height", value: formatMm(dimensions.maxHeightMm) },
    {
      label: "Max patches",
      value: dimensions.maxPatches != null ? String(dimensions.maxPatches) : "—",
    },
  ];

  const hasAny = rows.some((r) => r.value !== "—");
  if (!hasAny) {
    return <p className="text-sm text-ink-subtle">No dimensions set</p>;
  }

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-ink-subtle">{row.label}</dt>
          <dd className="font-medium text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
