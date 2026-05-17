"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
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
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import type { PaginatedResponse } from "@/lib/types/common";

interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
}

interface FinanceTablePageProps<T> {
  title: string;
  fetcher: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>;
  columns: Column<T>[];
  emptyTitle?: string;
  orderLink?: (row: T) => string | null;
}

export function FinanceTablePage<T extends { id: string }>({
  title,
  fetcher,
  columns,
  emptyTitle = "No records",
  orderLink,
}: FinanceTablePageProps<T>) {
  const router = useRouter();
  const { data, pagination, setPage, loading, error } = usePaginatedFetch(fetcher);

  return (
    <AppShell title={title}>
      <Card className="p-0">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-sm text-error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <Th key={col.header}>{col.header}</Th>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const href = orderLink?.(row);
                  return (
                    <TableRow
                      key={row.id}
                      onClick={
                        href
                          ? () => router.push(href)
                          : undefined
                      }
                    >
                      {columns.map((col) => (
                        <Td key={col.header}>{col.cell(row)}</Td>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {pagination ? (
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            ) : null}
          </>
        )}
      </Card>
    </AppShell>
  );
}
