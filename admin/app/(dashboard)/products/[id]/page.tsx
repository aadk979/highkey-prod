"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Upload, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { ProductDimensionsDisplay } from "@/components/products/product-dimensions-display";
import { ProductForm } from "@/components/products/product-form";
import { productsApi } from "@/lib/api/products";
import { formatCents, formatDate } from "@/lib/utils";
import type { Product, ProductImage } from "@/lib/types/product";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [stockDelta, setStockDelta] = useState("1");
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState<ProductImage[]>([]);
  const [uploadingTemplates, setUploadingTemplates] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.get(id);
      setProduct(data);
      if (data.productType === "accessory") {
        const tplData = await productsApi
          .getCustomisationTemplates(id)
          .catch(() => ({ images: [] }));
        setTemplates(tplData.images);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive() {
    if (!product) return;
    const updated = product.isActive
      ? await productsApi.deactivate(id)
      : await productsApi.activate(id);
    setProduct(updated);
  }

  async function adjustStock(sign: 1 | -1) {
    const delta = sign * (parseInt(stockDelta, 10) || 1);
    const updated = await productsApi.adjustStock(id, delta);
    setProduct(updated);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      await productsApi.uploadImages(id, Array.from(files));
      await load();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleTemplateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingTemplates(true);
    try {
      await productsApi.uploadCustomisationTemplates(id, Array.from(files));
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload templates");
    } finally {
      setUploadingTemplates(false);
      e.target.value = "";
    }
  }

  async function deleteTemplate(imageId: string) {
    if (!confirm("Delete this template?")) return;
    try {
      await productsApi.deleteCustomisationTemplate(id, imageId);
      setTemplates(templates.filter((t) => t.id !== imageId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete template");
    }
  }

  if (loading) return <PageLoader />;
  if (!product) {
    return (
      <AppShell title="Product">
        <p className="text-ink-subtle">Product not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={product.name}>
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-subtle hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={product.name}
            description={product.description ?? "No description"}
            action={<ActiveBadge active={product.isActive} />}
          />
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-subtle">Type</dt>
              <dd className="font-medium capitalize text-ink">
                {product.productType}
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Price</dt>
              <dd className="font-medium text-ink">
                {formatCents(product.basePriceCents, product.currencyCode)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Stock</dt>
              <dd className="font-medium text-ink">{product.availableStock}</dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Customizable</dt>
              <dd className="font-medium text-ink">
                {product.isCustomizable ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Created</dt>
              <dd className="text-ink">{formatDate(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-ink-subtle">ID</dt>
              <dd className="font-mono text-xs text-ink select-all">
                {product.id}
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Currency</dt>
              <dd className="font-medium text-ink">{product.currencyCode}</dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Updated</dt>
              <dd className="text-ink">{formatDate(product.updatedAt)}</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-hairline pt-6">
            <h3 className="mb-3 text-sm font-medium text-ink">Dimensions</h3>
            <ProductDimensionsDisplay dimensions={product.dimensions} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Actions" />
          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit product
            </Button>
            <Button
              variant={product.isActive ? "danger" : "primary"}
              onClick={toggleActive}
            >
              {product.isActive ? "Deactivate" : "Activate"}
            </Button>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustStock(-1)}
              >
                <Minus className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustStock(1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2">
              <Upload className="size-4" />
              {uploading ? "Uploading…" : "Upload images"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
            {product.productType === "accessory" && (
              <label
                className={`flex items-center justify-center gap-2 rounded-md border border-hairline px-3 py-2 text-sm font-medium ${
                  uploadingTemplates || templates.length > 0
                    ? "bg-surface-2 text-ink-subtle cursor-not-allowed opacity-60"
                    : "bg-surface-1 text-ink hover:bg-surface-2 cursor-pointer"
                }`}
              >
                <Upload className="size-4" />
                {uploadingTemplates
                  ? "Uploading…"
                  : "Upload customization image"}
                <input
                  type="file"
                  accept="image/png,image/webp"
                  className="hidden"
                  disabled={uploadingTemplates || templates.length > 0}
                  onChange={handleTemplateUpload}
                />
              </label>
            )}
          </div>
        </Card>
      </div>

      {product.imageIds.length > 0 ? (
        <Card className="mt-6">
          <CardHeader title="Images" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {product.imageIds.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="aspect-square rounded-lg border border-hairline object-cover"
              />
            ))}
          </div>
        </Card>
      ) : null}

      {product.productType === "accessory" && templates.length > 0 ? (
        <Card className="mt-6">
          <CardHeader title="Customization Image" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tpl.url}
                  alt=""
                  className="aspect-square rounded-lg border border-hairline object-cover w-full"
                />
                <button
                  type="button"
                  onClick={() => deleteTemplate(tpl.id)}
                  className="absolute top-2 right-2 p-1.5 bg-error text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete template"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit product"
      >
        <ProductForm
          initial={product}
          onCancel={() => setEditOpen(false)}
          onSubmit={async (payload) => {
            const { availableStock, ...productPayload } = payload;
            const nextStock = availableStock ?? product.availableStock;
            const stockDelta = nextStock - product.availableStock;
            let updated = await productsApi.update(id, productPayload);
            if (stockDelta !== 0) {
              updated = await productsApi.adjustStock(id, stockDelta);
            }
            setProduct(updated);
            setEditOpen(false);
          }}
        />
      </Modal>
    </AppShell>
  );
}
