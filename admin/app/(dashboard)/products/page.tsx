"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Select } from "@/components/ui/select";
import { ProductForm } from "@/components/products/product-form";
import { productsApi } from "@/lib/api/products";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { formatCents, formatDate } from "@/lib/utils";
import type { ProductType } from "@/lib/types/product";

export default function ProductsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<ProductType | "">("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetcher = useCallback(
    (params: { page: number; limit: number }) =>
      productsApi.list({
        ...params,
        type: typeFilter || undefined,
      }),
    [typeFilter],
  );

  const { data, pagination, page, setPage, loading, error, reload } =
    usePaginatedFetch(fetcher, [typeFilter]);

  return (
    <AppShell title="Products">
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline p-4">
          <Select
            label=""
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as ProductType | "");
              setPage(1);
            }}
            className="w-40"
          >
            <option value="">All types</option>
            <option value="base">Base</option>
            <option value="accessory">Accessory</option>
          </Select>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add product
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-sm text-error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState
            title="No products"
            description="Create your first product to get started."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Add product
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th>ID</Th>
                  <Th>Description</Th>
                  <Th>Customizable</Th>
                  <Th>Currency</Th>
                  <Th>Images</Th>
                  <Th>Dimensions</Th>
                  <Th>Created</Th>
                  <Th>Updated</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((product) => (
                  <TableRow
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <Td className="font-medium text-ink">{product.name}</Td>
                    <Td className="capitalize">{product.productType}</Td>
                    <Td>
                      {formatCents(
                        product.basePriceCents,
                        product.currencyCode,
                      )}
                    </Td>
                    <Td>{product.availableStock}</Td>
                    <Td>
                      <ActiveBadge active={product.isActive} />
                    </Td>
                    <Td>
                      <span className="font-mono text-xs" title={product.id}>
                        {product.id.slice(0, 8)}&hellip;
                      </span>
                    </Td>
                    <Td>
                      <span
                        className="block max-w-[200px] truncate"
                        title={product.description ?? "null"}
                      >
                        {product.description ?? "null"}
                      </span>
                    </Td>
                    <Td>{product.isCustomizable ? "Yes" : "No"}</Td>
                    <Td>{product.currencyCode}</Td>
                    <Td>{product.imageIds.length}</Td>
                    <Td>
                      {product.dimensions != null
                        ? `${product.dimensions.maxWidthMm ?? "?"}\u00d7${product.dimensions.maxHeightMm ?? "?"} mm`
                        : "null"}
                    </Td>
                    <Td>{formatDate(product.createdAt)}</Td>
                    <Td>{formatDate(product.updatedAt)}</Td>
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
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New product"
      >
        <ProductForm
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (payload) => {
            await productsApi.create(payload);
            setCreateOpen(false);
            reload();
          }}
        />
      </Modal>
    </AppShell>
  );
}
