"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/api/storefront";
import type { Product } from "@/lib/types/storefront";
import { ProductDisplay } from "./productDisplay";
import { ProductsLoading } from "./productsLoading";
import type { PaginatedProducts } from "@/lib/types/storefront";

const filters = ["All", "Base", "Accessory"] as const;
type Filter = (typeof filters)[number];

export function ShopClient({
  initialProducts,
}: {
  initialProducts: PaginatedProducts | null;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const [products, setProducts] = useState<Product[] | null>(
    initialProducts?.data ?? null
  );
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
  } | null>(
    initialProducts
      ? {
          page: initialProducts.pagination.page,
          totalPages: initialProducts.pagination.totalPages,
        }
      : null
  );
  const [page, setPage] = useState(1);
  const [productsLoading, setProductsLoading] = useState(!initialProducts);
  const [productsError, setProductsError] = useState(!initialProducts);

  useEffect(() => {
    async function fetchData() {
      if (filter === "All" && page === 1 && initialProducts) {
        setProducts(initialProducts.data);
        setPagination({
          page: initialProducts.pagination.page,
          totalPages: initialProducts.pagination.totalPages,
        });
        setProductsLoading(false);
        setProductsError(false);
        return;
      }

      setProductsLoading(true);
      setProductsError(false);
      try {
        const type =
          filter === "Base"
            ? "base"
            : filter === "Accessory"
              ? "accessory"
              : undefined;
        const json = await listProducts({ page, limit: 20, type });
        setProducts(json.data);
        setPagination({
          page: json.pagination.page,
          totalPages: json.pagination.totalPages,
        });
      } catch {
        setProductsError(true);
        setProducts(null);
      } finally {
        setProductsLoading(false);
      }
    }

    fetchData();
  }, [filter, page, initialProducts]);

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
          <motion.div layout className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
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
          <ProductDisplay
            products={products ?? []}
            loadError={productsError}
          />
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
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
