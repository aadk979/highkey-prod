import { create } from "zustand";
import type { Product, ProductDimensions } from "@/lib/types/storefront";

export type PlacedPatch = {
  id: string;
  productId: string;
  x: number;
  y: number;
  priceCents: number;
  name: string;
  wCm: number;
  hCm: number;
};

export type BuilderBase = {
  id: string;
  name: string;
  basePriceCents: number;
  currencyCode: string;
  imageIds: string[];
  dimensions: ProductDimensions;
  colorKey: string;
};

type BuilderState = {
  activeBase: BuilderBase | null;
  placedPatches: PlacedPatch[];
  history: PlacedPatch[][];
  historyIndex: number;

  setActiveBase: (product: Product) => void;
  addPatch: (patch: Omit<PlacedPatch, "id">) => void;
  removePatch: (id: string) => void;
  updatePatchPosition: (id: string, x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  clear: () => void;
};

function colorKeyFromName(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("midnight")) return "midnight_blue";
  if (normalized.includes("sky")) return "sky_blue";
  if (normalized.includes("classic")) return "classic_blue";
  if (normalized.includes("indigo")) return "indigo_blue";
  if (normalized.includes("steel")) return "light_steel_blue";
  return "classic_blue";
}

export function productToBuilderBase(product: Product): BuilderBase {
  const dimensions = product.dimensions ?? {
    maxWidthMm: 50,
    maxHeightMm: 120,
    minWidthMm: 50,
    minHeightMm: 120,
    maxPatches: 5,
  };

  return {
    id: product.id,
    name: product.name,
    basePriceCents: product.basePriceCents,
    currencyCode: product.currencyCode,
    imageIds: product.imageIds,
    dimensions,
    colorKey: colorKeyFromName(product.name),
  };
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  activeBase: null,
  placedPatches: [],
  history: [[]],
  historyIndex: 0,

  setActiveBase: (product) =>
    set({
      activeBase: productToBuilderBase(product),
      placedPatches: [],
      history: [[]],
      historyIndex: 0,
    }),

  addPatch: (patch) =>
    set((state) => {
      const newPatch = { ...patch, id: crypto.randomUUID() };
      const newPatches = [...state.placedPatches, newPatch];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        placedPatches: newPatches,
        history: [...newHistory, newPatches],
        historyIndex: state.historyIndex + 1,
      };
    }),

  removePatch: (id) =>
    set((state) => {
      const newPatches = state.placedPatches.filter((p) => p.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        placedPatches: newPatches,
        history: [...newHistory, newPatches],
        historyIndex: state.historyIndex + 1,
      };
    }),

  updatePatchPosition: (id, x, y) =>
    set((state) => {
      const newPatches = state.placedPatches.map((p) =>
        p.id === id ? { ...p, x, y } : p
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        placedPatches: newPatches,
        history: [...newHistory, newPatches],
        historyIndex: state.historyIndex + 1,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          placedPatches: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          placedPatches: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    }),

  reset: () =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        placedPatches: [],
        history: [...newHistory, []],
        historyIndex: state.historyIndex + 1,
      };
    }),

  clear: () =>
    set({
      activeBase: null,
      placedPatches: [],
      history: [[]],
      historyIndex: 0,
    }),
}));
