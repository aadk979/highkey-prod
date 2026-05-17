"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  Td,
  Th,
  EmptyState,
} from "@/components/ui/table";
import { PageLoader } from "@/components/ui/spinner";
import { PaginationBar } from "@/components/ui/pagination";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { ordersApi, roadshowApi, type RoadshowSaleResult } from "@/lib/api/orders";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { formatCents, formatDate } from "@/lib/utils";
import {
  Store,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  QrCode,
  ListOrdered,
} from "lucide-react";

// ─── Tab types ───────────────────────────────────────────────────────────────
type Tab = "create" | "history";

// ─── Create Sale Panel ───────────────────────────────────────────────────────
function CreateSalePanel() {
  const [priceCents, setPriceCents] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoadshowSaleResult | null>(null);
  const [copied, setCopied] = useState(false);

  const priceInCents = Math.round(parseFloat(priceCents || "0") * 100);
  const isValid = priceInCents > 0 && location.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await roadshowApi.create({
        priceCents: priceInCents,
        location: location.trim(),
        description: description.trim() || undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create roadshow sale.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.checkoutUrl) return;
    await navigator.clipboard.writeText(result.checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPriceCents("");
    setLocation("");
    setDescription("");
  };

  if (result) {
    return (
      <Card className="overflow-hidden p-0">
        {/* Success banner */}
        <div className="flex items-center gap-3 border-b border-hairline bg-success/8 px-5 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15">
            <Check className="size-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Payment link ready</p>
            <p className="text-xs text-ink-subtle">
              Ask the customer to scan the QR code or open the link below.
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              QR Code
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.qrCode}
              alt="Payment QR code"
              className="size-56 rounded-xl border border-hairline shadow-sm"
            />
            <p className="text-xs text-ink-subtle">
              Customer scans this to pay via Stripe
            </p>
          </div>

          {/* Checkout URL */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-muted">
              Checkout Link
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-1 px-3 py-2">
              <code className="flex-1 truncate text-xs text-ink">
                {result.checkoutUrl}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                title="Copy link"
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
              <a
                href={result.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                title="Open in new tab"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>

          {/* Session ID */}
          <div>
            <p className="mb-1 text-xs font-medium text-ink-muted">
              Stripe Session ID
            </p>
            <code className="block truncate text-xs text-ink-subtle">
              {result.sessionId}
            </code>
          </div>

          <Button className="w-full" onClick={handleReset}>
            <RefreshCw className="mr-2 size-4" />
            Create Another Sale
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Price */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Sale Price (SGD)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-subtle">
              $
            </span>
            <input
              type="number"
              min="0.50"
              step="0.01"
              placeholder="35.00"
              required
              value={priceCents}
              onChange={(e) => setPriceCents(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-canvas py-2 pl-7 pr-4 text-sm text-ink shadow-xs transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {priceInCents > 0 && (
            <p className="mt-1 text-xs text-ink-subtle">
              = {formatCents(priceInCents, "SGD")}
            </p>
          )}
        </div>

        <Input
          label="Location"
          placeholder="e.g. Suntec City Hall 3"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Description{" "}
            <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Shown to customer on Stripe checkout page"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink shadow-xs transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 px-3 py-2.5 text-sm text-error">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" disabled={!isValid || loading} className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="size-4 animate-spin" />
              Generating…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <QrCode className="size-4" />
              Generate Payment Link &amp; QR Code
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel() {
  const router = useRouter();

  const fetcher = useCallback(
    (params: { page: number; limit: number }) =>
      ordersApi.list({ ...params, roadshow: true }),
    [],
  );

  const { data, pagination, setPage, loading, error } = usePaginatedFetch(
    fetcher,
    [],
  );

  return (
    <Card className="p-0">
      {loading ? (
        <PageLoader />
      ) : error ? (
        <p className="p-6 text-sm text-error">{error}</p>
      ) : data.length === 0 ? (
        <EmptyState
          title="No roadshow orders yet"
          description="Orders will appear here after a customer pays via a roadshow link."
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <Th>#</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Payment</Th>
                <Th>Date</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((order) => (
                <TableRow
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <Td className="font-medium text-ink">#{order.orderNumber}</Td>
                  <Td>
                    <div className="text-ink">{order.customerName}</div>
                    <div className="text-xs text-ink-subtle">
                      {order.customerEmail}
                    </div>
                  </Td>
                  <Td>
                    {formatCents(order.grandTotalCents, order.currencyCode)}
                  </Td>
                  <Td>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </Td>
                  <Td>{formatDate(order.createdAt)}</Td>
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RoadshowPage() {
  const [tab, setTab] = useState<Tab>("create");

  return (
    <AppShell title="Roadshow Mode">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header banner */}
        <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Store className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Roadshow / Booth Sales
            </h2>
            <p className="text-xs text-ink-subtle">
              Generate Stripe payment links for physical booth sales. Orders are
              created automatically after the customer pays.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-hairline bg-surface-1 p-1">
          <button
            type="button"
            onClick={() => setTab("create")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "create"
                ? "bg-canvas text-ink shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <QrCode className="size-4" />
            New Sale
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "history"
                ? "bg-canvas text-ink shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <ListOrdered className="size-4" />
            Order History
          </button>
        </div>

        {tab === "create" ? <CreateSalePanel /> : <HistoryPanel />}
      </div>
    </AppShell>
  );
}
