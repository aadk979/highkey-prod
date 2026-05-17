"use client";

import React from "react";
import { motion } from "framer-motion";

const ShimmerBlock = ({ className }: { className: string }) => (
  <motion.div
    className={`relative overflow-hidden bg-section/80 ${className}`}
    initial={{ opacity: 0.6 }}
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
  >
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{
        repeat: Infinity,
        duration: 1.4,
        ease: "linear",
        repeatDelay: 0.15,
      }}
      className="absolute inset-y-0 -inset-x-full z-10 w-[150%] bg-gradient-to-r from-transparent via-foreground/8 to-transparent"
      style={{ skewX: -18 }}
    />
  </motion.div>
);

export const ProductsLoading = () => {
  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="mb-8 flex justify-between px-1 pb-4 border-b border-border/40">
        <ShimmerBlock className="h-3 w-24 rounded" />
        <ShimmerBlock className="h-3 w-16 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i, index) => (
          <motion.div
            key={i}
            className={index === 0 ? "sm:col-span-2" : ""}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.07,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <ShimmerBlock
              className={`w-full rounded-[28px] border border-border/40 ${
                index === 0 ? "aspect-[16/10]" : "aspect-[4/5]"
              }`}
            />
            <motion.div layout className="mt-4 flex justify-between gap-4 px-1">
              <div className="flex flex-col gap-2 flex-1">
                <ShimmerBlock className="h-7 rounded-lg w-[75%]" />
                <ShimmerBlock className="h-5 rounded-lg w-[40%]" />
              </div>
              <ShimmerBlock className="h-9 w-20 rounded-full shrink-0" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
