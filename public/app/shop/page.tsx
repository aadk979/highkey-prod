"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/api/storefront";
import type { Product } from "@/lib/types/storefront";
import { ProductDisplay } from "./productDisplay";
import { ProductsLoading } from "./productsLoading";

const filters = ["All", "Base", "Accessory"] as const;
type Filter = (typeof filters)[number];

const filterQueryValues: Record<Filter, "base" | "accessory" | null> = {
  All: null,
  Base: "base",
  Accessory: "accessory",
};

function parseFilterParam(value: string | null): Filter {
  if (value === "base") return "Base";
  if (value === "accessory") return "Accessory";
  return "All";
}

function parsePageParam(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = useMemo(
    () => parseFilterParam(searchParams.get("filter")),
    [searchParams]
  );
  const page = useMemo(
    () => parsePageParam(searchParams.get("page")),
    [searchParams]
  );
  const [products, setProducts] = useState<Product[] | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);

  const updateShopUrl = useCallback(
    (
      nextState: { filter?: Filter; page?: number },
      history: "push" | "replace" = "push"
    ) => {
      const nextFilter = nextState.filter ?? filter;
      const nextPage = nextState.page ?? page;
      const params = new URLSearchParams(searchParams.toString());
      const filterValue = filterQueryValues[nextFilter];

      if (filterValue) {
        params.set("filter", filterValue);
      } else {
        params.delete("filter");
      }

      if (nextPage > 1) {
        params.set("page", String(nextPage));
      } else {
        params.delete("page");
      }

      const queryString = params.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;
      router[history](href, { scroll: false });
    },
    [filter, page, pathname, router, searchParams]
  );

  useEffect(() => {
    const rawFilter = searchParams.get("filter");
    const rawPage = searchParams.get("page");
    const expectedFilter = filterQueryValues[filter];
    const hasNonCanonicalFilter =
      rawFilter !== expectedFilter && !(rawFilter === null && expectedFilter === null);
    const hasNonCanonicalPage =
      (rawPage === null && page !== 1) || (rawPage !== null && rawPage !== String(page));

    if (hasNonCanonicalFilter || hasNonCanonicalPage) {
      updateShopUrl({ filter, page }, "replace");
    }
  }, [filter, page, searchParams, updateShopUrl]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setProductsLoading(true);
      setProductsError(false);

      try {
        const type = filterQueryValues[filter] ?? undefined;
        const json = await listProducts({ page, limit: 20, type });

        if (ignore) return;

        if (json.pagination.totalPages > 0 && page > json.pagination.totalPages) {
          updateShopUrl({ page: json.pagination.totalPages }, "replace");
          return;
        }

        setProducts(json.data);
        setPagination({
          page: json.pagination.page,
          totalPages: json.pagination.totalPages,
        });
      } catch {
        if (ignore) return;
        setProductsError(true);
        setProducts(null);
      } finally {
        if (!ignore) {
          setProductsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [filter, page, updateShopUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-screen bg-background"
    >
      <section className="bg-section w-full py-16 px-6 border-b border-border text-center">
        <h1 className="font-heading font-light text-5xl md:text-[70px] leading-tight text-foreground mb-4">
          Choose your canvas.
        </h1>
        <p className="text-muted text-[18px] mb-6">
          Every piece is cut from upcycled denim.
        </p>
      </section>

      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="max-w-[1200px] mx-auto h-[60px] flex items-center justify-between"
        >
          <motion.div
            layout
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar"
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => {
                  updateShopUrl({ filter: f, page: 1 });
                }}
                className={`text-sm font-medium whitespace-nowrap px-1 relative transition-colors duration-300 py-4 ${
                  filter === f
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f}
                {filter === f && (
                  <motion.div
                    layoutId="filter-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  />
                )}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="py-12 px-6 flex-1">
        {productsLoading ? (
          <ProductsLoading />
        ) : (
          <ProductDisplay products={products ?? []} loadError={productsError} />
        )}

        {!productsLoading &&
          !productsError &&
          pagination &&
          pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-12 flex justify-center items-center gap-4"
            >
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateShopUrl({ page: Math.max(1, page - 1) })}
                className="rounded-full px-6"
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Page <span className="text-foreground">{page}</span> of{" "}
                <span className="text-foreground">{pagination.totalPages}</span>
              </span>
              <Button
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  updateShopUrl({
                    page: Math.min(pagination.totalPages, page + 1),
                  })
                }
                className="rounded-full px-6"
              >
                Next
              </Button>
            </motion.div>
          )}
      </section>
    </motion.div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopPageContent />
    </Suspense>
  );
}
