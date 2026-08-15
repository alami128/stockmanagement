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
  available: "bg-emerald-100 text-emerald-700",
  low: "bg-amber-100 text-amber-700",
  needs_order: "bg-rose-100 text-rose-700",
};

export const STOCK_STATUS_BAR: Record<StockStatus, string> = {
  available: "bg-available",
  low: "bg-amber-500",
  needs_order: "bg-unavailable",
};

// How much to add/remove per tap of the increment buttons, per unit.
export const STOCK_STEP: Record<StockUnit, number> = {
  pcs: 1,
  bottle: 1,
  kg: 0.5,
  g: 100,
  L: 0.5,
  ml: 100,
};

export const UNIT_LABEL: Record<StockUnit, { singular: string; plural: string }> = {
  pcs: { singular: "pc", plural: "pcs" },
  bottle: { singular: "bottle", plural: "bottles" },
  kg: { singular: "kg", plural: "kg" },
  g: { singular: "g", plural: "g" },
  L: { singular: "L", plural: "L" },
  ml: { singular: "ml", plural: "ml" },
};

export function formatQuantity(quantity: number, unit: StockUnit): string {
  const trimmed = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const label =
    quantity === 1 ? UNIT_LABEL[unit].singular : UNIT_LABEL[unit].plural;
  return `${trimmed} ${label}`;
}
