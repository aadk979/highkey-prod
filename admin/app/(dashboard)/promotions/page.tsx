"use client";

import { useCallback, useState } from "react";
import { Plus, Percent, DollarSign, Globe, Package } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import {
  EmptyState,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Td,
  Th,
} from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination";
import { promotionsApi } from "@/lib/api/promotions";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { formatDate } from "@/lib/utils";

type DiscountType = "percentage" | "fixed";
type ScopeType = "storeWide" | "product";

const EMPTY_FORM = {
  discountType: "percentage" as DiscountType,
  discountValue: "",
  scope: "storeWide" as ScopeType,
  productId: "",
  startDate: "",
  endDate: "",
  trackByPhone: false,
  usageLimit: "",
  isActive: true,
};

export default function PromotionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number }) => promotionsApi.list(params),
    [],
  );

  const { data, pagination, setPage, loading, error, reload } =
    usePaginatedFetch(fetcher);

  function openModal() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function set<K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Validate at least one discount value
    if (!form.discountValue || parseFloat(form.discountValue) < 0) {
      setFormError("Enter a valid discount amount.");
      return;
    }
    // Validate product ID when scope is product-specific
    if (form.scope === "product" && !form.productId.trim()) {
      setFormError("Enter the product ID for a product-specific promotion.");
      return;
    }

    const discountParsed = parseFloat(form.discountValue);

    const body: Record<string, unknown> = {
      storeWide: form.scope === "storeWide",
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      trackByPhone: form.trackByPhone,
      isActive: form.isActive,
    };

    if (form.discountType === "percentage") {
      body.discountPercentage = discountParsed;
      body.discountValueCents = null;
    } else {
      body.discountValueCents = Math.round(discountParsed * 100);
      body.discountPercentage = null;
    }

    if (form.scope === "product") {
      body.productId = form.productId.trim();
    } else {
      body.productId = null;
    }

    if (form.usageLimit) {
      body.usageLimit = parseInt(form.usageLimit, 10);
    } else {
      body.usageLimit = null;
    }

    setSaving(true);
    try {
      await promotionsApi.create(body as any);
      setModalOpen(false);
      reload();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create promotion.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    if (isActive) await promotionsApi.deactivate(id);
    else await promotionsApi.activate(id);
    reload();
  }

  return (
    <AppShell title="Promotions">
      <Card className="p-0">
        <div className="flex justify-end border-b border-hairline p-4">
          <Button onClick={openModal}>
            <Plus className="size-4" />
            Add promotion
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-sm text-error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState title="No promotions" />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>Scope</Th>
                  <Th>Discount</Th>
                  <Th>Period</Th>
                  <Th>Usage limit</Th>
                  <Th>Status</Th>
                  <Th>ID</Th>
                  <Th>Product ID</Th>
                  <Th>Track by Phone</Th>
                  <Th>Created</Th>
                  <Th>Updated</Th>
                  <Th>Actions</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((promo) => (
                  <TableRow key={promo.id}>
                    <Td className="text-ink">
                      {promo.storeWide
                        ? "Store-wide"
                        : (promo.product?.name ?? promo.productId ?? "Product")}
                    </Td>
                    <Td>
                      {promo.discountPercentage != null
                        ? `${promo.discountPercentage}%`
                        : promo.discountValueCents != null
                          ? `$${(promo.discountValueCents / 100).toFixed(2)} off`
                          : "—"}
                    </Td>
                    <Td className="text-xs">
                      {formatDate(promo.startDate)} –{" "}
                      {formatDate(promo.endDate)}
                    </Td>
                    <Td className="text-xs text-ink-muted">
                      {promo.usageLimit ?? "Unlimited"}
                    </Td>
                    <Td>
                      <ActiveBadge active={promo.isActive} />
                    </Td>
                    <Td>
                      <span className="font-mono text-xs" title={promo.id}>
                        {promo.id.slice(0, 8)}&hellip;
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs">
                        {promo.productId ?? "null"}
                      </span>
                    </Td>
                    <Td>{promo.trackByPhone ? "Yes" : "No"}</Td>
                    <Td>{formatDate(promo.createdAt)}</Td>
                    <Td>{formatDate(promo.updatedAt)}</Td>
                    <Td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(promo.id, promo.isActive)}
                      >
                        {promo.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination ? (
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            ) : null}
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New promotion"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          {/* ── Scope ── */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Scope
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("scope", "storeWide")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.scope === "storeWide"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink"
                }`}
              >
                <Globe className="size-4 shrink-0" />
                Store-wide
              </button>
              <button
                type="button"
                onClick={() => set("scope", "product")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.scope === "product"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink"
                }`}
              >
                <Package className="size-4 shrink-0" />
                Product only
              </button>
            </div>
            {form.scope === "product" && (
              <Input
                label="Product ID (UUID)"
                placeholder="e.g. 0b5f6d…"
                value={form.productId}
                onChange={(e) => set("productId", e.target.value)}
                required
              />
            )}
          </fieldset>

          {/* ── Discount type ── */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Discount type
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("discountType", "percentage")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.discountType === "percentage"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink"
                }`}
              >
                <Percent className="size-4 shrink-0" />
                Percentage
              </button>
              <button
                type="button"
                onClick={() => set("discountType", "fixed")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.discountType === "fixed"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink"
                }`}
              >
                <DollarSign className="size-4 shrink-0" />
                Fixed value
              </button>
            </div>
            <Input
              label={
                form.discountType === "percentage"
                  ? "Discount percentage (0–100)"
                  : "Discount amount ($)"
              }
              type="number"
              min="0"
              max={form.discountType === "percentage" ? "100" : undefined}
              step={form.discountType === "percentage" ? "1" : "0.01"}
              placeholder={
                form.discountType === "percentage" ? "e.g. 20" : "e.g. 15.00"
              }
              required
              value={form.discountValue}
              onChange={(e) => set("discountValue", e.target.value)}
            />
          </fieldset>

          {/* ── Dates ── */}
          <fieldset className="grid grid-cols-2 gap-3">
            <Input
              label="Start date & time"
              type="datetime-local"
              required
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
            <Input
              label="End date & time"
              type="datetime-local"
              required
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </fieldset>

          {/* ── Options ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Options
            </legend>
            <Input
              label="Usage limit (leave blank for unlimited)"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 100"
              value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
            />
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.trackByPhone}
                onChange={(e) => set("trackByPhone", e.target.checked)}
                className="accent-primary size-4"
              />
              <span className="text-ink">Track usage by phone number</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="accent-primary size-4"
              />
              <span className="text-ink">Active immediately</span>
            </label>
          </fieldset>

          {formError && (
            <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-hairline pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create promotion
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
