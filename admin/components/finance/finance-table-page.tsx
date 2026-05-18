"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
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
  fetcher: (params: {
    page: number;
    limit: number;
  }) => Promise<PaginatedResponse<T>>;
  columns: Column<T>[];
  emptyTitle?: string;
  orderLink?: (row: T) => string | null;
  expandRow?: (row: T) => React.ReactNode;
}

export function FinanceTablePage<T extends { id: string }>({
  title,
  fetcher,
  columns,
  emptyTitle = "No records",
  orderLink,
  expandRow,
}: FinanceTablePageProps<T>) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, pagination, setPage, loading, error } =
    usePaginatedFetch(fetcher);

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
                  {expandRow && <Th className="w-10" />}
                  {columns.map((col) => (
                    <Th key={col.header}>{col.header}</Th>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const href = orderLink?.(row);
                  const isExpanded = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        onClick={() => {
                          if (expandRow) {
                            setExpandedId(isExpanded ? null : row.id);
                          } else if (href) {
                            router.push(href);
                          }
                        }}
                      >
                        {expandRow && (
                          <td className="w-10 px-3 py-4 text-ink-subtle">
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </td>
                        )}
                        {columns.map((col) => (
                          <Td key={col.header}>{col.cell(row)}</Td>
                        ))}
                      </TableRow>
                      {expandRow && isExpanded && (
                        <tr className="border-b border-hairline bg-surface-1">
                          <td
                            colSpan={columns.length + 1}
                            className="px-6 pb-6 pt-4"
                          >
                            {expandRow(row)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
