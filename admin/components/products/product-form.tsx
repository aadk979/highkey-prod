"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ProductDimensionsFields,
  buildDimensionsPayload,
  dimensionFieldsFromProduct,
} from "@/components/products/product-dimensions-fields";
import type { CreateProductPayload, Product, ProductType } from "@/lib/types/product";

interface ProductFormProps {
  initial?: Product;
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initial, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [productType, setProductType] = useState<ProductType>(
    initial?.productType ?? "base",
  );
  const [basePrice, setBasePrice] = useState(
    initial ? (initial.basePriceCents / 100).toFixed(2) : "",
  );
  const [stock, setStock] = useState(String(initial?.availableStock ?? 0));
  const [isCustomizable, setIsCustomizable] = useState(
    initial?.isCustomizable ?? false,
  );
  const [dimensionFields, setDimensionFields] = useState(() =>
    dimensionFieldsFromProduct(initial?.dimensions),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const dimensions = buildDimensionsPayload(dimensionFields);
      await onSubmit({
        name,
        description: description || undefined,
        productType,
        isCustomizable,
        basePriceCents: Math.round(parseFloat(basePrice) * 100),
        availableStock: parseInt(stock, 10) || 0,
        currencyCode: initial?.currencyCode ?? "SGD",
        ...(dimensions ? { dimensions } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Select
        label="Type"
        value={productType}
        onChange={(e) => setProductType(e.target.value as ProductType)}
      >
        <option value="base">Base</option>
        <option value="accessory">Accessory</option>
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (SGD)"
          type="number"
          step="0.01"
          min="0"
          required
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={isCustomizable}
          onChange={(e) => setIsCustomizable(e.target.checked)}
          className="rounded border-hairline text-primary focus:ring-primary"
        />
        Customizable product
      </label>
      <ProductDimensionsFields values={dimensionFields} onChange={setDimensionFields} />
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
