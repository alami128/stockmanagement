import type { Item, StockStatus, StockUnit } from "@/lib/types";

export function getStockStatus(item: Pick<Item, "quantity" | "low_stock_threshold">): StockStatus {
  if (item.quantity <= 0) return "needs_order";
  if (item.quantity <= item.low_stock_threshold) return "low";
  return "available";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  available: "Available",
  low: "Running Low",
  needs_order: "Out of Stock",
};

// Tailwind-safe static class strings (no dynamic interpolation)
// Outline “stroke” pills for status titles — items stay black & white.
export const STOCK_STATUS_BADGE: Record<StockStatus, string> = {
  available: "border-2 border-green-500 bg-white text-green-700",
  low: "border-2 border-yellow-500 bg-white text-yellow-700",
  needs_order: "border-2 border-red-500 bg-white text-red-700",
};

export const STOCK_STATUS_BAR: Record<StockStatus, string> = {
  available: "bg-neutral-400",
  low: "bg-neutral-500",
  needs_order: "bg-neutral-800",
};

export const STOCK_STATUS_TEXT: Record<StockStatus, string> = {
  available: "text-green-700",
  low: "text-yellow-700",
  needs_order: "text-red-700",
};

export const STOCK_STATUS_BORDER: Record<StockStatus, string> = {
  available: "border-green-500",
  low: "border-yellow-500",
  needs_order: "border-red-500",
};

// How much to add/remove per tap of the increment buttons, per unit.
export const STOCK_STEP: Record<StockUnit, number> = {
  pcs: 1,
  bottle: 1,
  bags: 1,
  packets: 1,
  kg: 0.5,
  g: 100,
  L: 0.5,
  ml: 100,
};

export const UNIT_LABEL: Record<StockUnit, { singular: string; plural: string }> = {
  pcs: { singular: "pc", plural: "pcs" },
  bottle: { singular: "bottle", plural: "bottles" },
  bags: { singular: "bag", plural: "bags" },
  packets: { singular: "packet", plural: "packets" },
  kg: { singular: "kg", plural: "kg" },
  g: { singular: "g", plural: "g" },
  L: { singular: "L", plural: "L" },
  ml: { singular: "ml", plural: "ml" },
};

export function formatQuantity(quantity: number, unit: StockUnit): string {
  const trimmed = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const labels = UNIT_LABEL[unit] ?? { singular: unit, plural: unit };
  const label = quantity === 1 ? labels.singular : labels.plural;
  return `${trimmed} ${label}`;
}

/** Short unit caption for UI (e.g. under item names). */
export function unitCaption(unit: StockUnit): string {
  switch (unit) {
    case "pcs":
      return "Pieces";
    case "bottle":
      return "Bottles";
    case "bags":
      return "Bags";
    case "packets":
      return "Packets";
    default:
      return unit;
  }
}

