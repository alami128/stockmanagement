"use client";

import { useState } from "react";
import StockStepper from "@/components/StockStepper";
import { CATEGORY_LABEL } from "@/lib/categories";
import { getStockStatus } from "@/lib/stock";
import type { Item, ItemCategory } from "@/lib/types";

export default function CategoryMenu({
  groups,
}: {
  groups: { category: ItemCategory; items: Item[] }[];
}) {
  // Open the first category that has something low / out, otherwise none.
  const defaultOpen =
    groups.find((g) =>
      g.items.some((item) => getStockStatus(item) !== "available")
    )?.category ?? null;

  const [open, setOpen] = useState<ItemCategory | null>(defaultOpen);

  function toggle(category: ItemCategory) {
    setOpen((prev) => (prev === category ? null : category));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {groups.map(({ category, items }, index) => {
        const isOpen = open === category;
        const attention = items.filter(
          (item) => getStockStatus(item) !== "available"
        ).length;

        return (
          <div
            key={category}
            className={index > 0 ? "border-t border-neutral-100" : ""}
          >
            <button
              type="button"
              onClick={() => toggle(category)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-neutral-50 active:bg-neutral-100"
            >
              <span className="font-display text-lg font-semibold text-neutral-900">
                {CATEGORY_LABEL[category]}
              </span>
              <span className="flex items-center gap-2.5">
                {attention > 0 && (
                  <span className="rounded-full border border-orange-500 bg-white px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-orange-700">
                    {attention} need attention
                  </span>
                )}
                <span className="text-sm tabular-nums text-neutral-400">
                  {items.length}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  className={`h-5 w-5 text-neutral-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 7.5 10 12.5 15 7.5" />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div className="space-y-2 border-t border-neutral-100 bg-neutral-50/60 px-3 py-3">
                {items.map((item) => (
                  <StockStepper key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
