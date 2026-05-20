"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginatedResponse, Pagination } from "@/lib/types/common";
import { ApiError } from "@/lib/types/common";
import { useUrlPageParam } from "@/hooks/use-url-query-state";

export function usePaginatedFetch<T>(
  fetcher: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>,
  deps: unknown[] = [],
  limit = 20,
) {
  void deps;

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useUrlPageParam();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher({ page, limit });
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, limit]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) void load();
    });

    return () => {
      active = false;
    };
  }, [load]);

  return { data, pagination, page, setPage, loading, error, reload: load };
}
