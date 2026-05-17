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
import { formatCents } from "@/lib/utils";
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
                    <Td>{formatCents(product.basePriceCents, product.currencyCode)}</Td>
                    <Td>{product.availableStock}</Td>
                    <Td>
                      <ActiveBadge active={product.isActive} />
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New product">
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
