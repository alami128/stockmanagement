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
export const STOCK_STATUS_BADGE: Record<StockStatus, string> = {
  available: "bg-green-100 text-green-700",
  low: "bg-amber-100 text-amber-700",
  needs_order: "bg-red-100 text-red-700",
};

export const STOCK_STATUS_BAR: Record<StockStatus, string> = {
  available: "bg-available",
  low: "bg-amber-500",
  needs_order: "bg-unavailable",
};

// How much to add/remove per tap of the increment buttons, per unit.
export const STOCK_STEP: Record<StockUnit, number> = {
  pcs: 1,
  kg: 0.5,
  g: 100,
  L: 0.5,
  ml: 100,
};

export function formatQuantity(quantity: number, unit: StockUnit): string {
  const trimmed = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${trimmed} ${unit}`;
}
