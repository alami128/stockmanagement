"use client";

import { useState, useTransition } from "react";
import ItemIcon from "@/components/ItemIcon";
import { removeItem, setItemQuantity } from "@/lib/actions/items";
import {
  getStockStatus,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABEL,
  STOCK_STATUS_BAR,
  STOCK_STEP,
  formatQuantity,
} from "@/lib/stock";
import type { Item } from "@/lib/types";

export default function StockStepper({ item }: { item: Item }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();
  const step = STOCK_STEP[item.unit] ?? 1;
  const status = getStockStatus({
    quantity,
    low_stock_threshold: item.low_stock_threshold,
  });

  function commit(next: number) {
    const safe = Math.max(0, Math.round(next / step) * step);
    setQuantity(safe);
    startTransition(() => {
      setItemQuantity(item.id, safe);
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Remove “${item.name}” completely from the kitchen list?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeItem(item.id);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "Failed to delete item.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ItemIcon
            name={item.name}
            unit={item.unit}
            status={status}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-neutral-900">
              {item.name}
            </p>
            <p className="text-xs text-neutral-400">
              {item.unit === "pcs"
                ? "Pieces"
                : item.unit === "bottle"
                  ? "Bottles"
                  : item.unit}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STOCK_STATUS_BADGE[status]}`}
        >
          {STOCK_STATUS_LABEL[status]}
        </span>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all ${STOCK_STATUS_BAR[status]}`}
          style={{
            width: `${Math.min(
              100,
              (quantity / Math.max(item.low_stock_threshold * 2, step)) * 100
            )}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => commit(quantity - step)}
          disabled={isPending || quantity <= 0}
          aria-label={`Decrease ${item.name}`}
          className="btn h-14 w-14 shrink-0 bg-neutral-100 p-0 text-2xl font-bold text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
        >
          −
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-2xl font-bold tabular-nums text-neutral-900">
            {formatQuantity(quantity, item.unit)}
          </p>
          <p className="text-xs text-neutral-400">
            reorder below {formatQuantity(item.low_stock_threshold, item.unit)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => commit(quantity + step)}
            disabled={isPending}
            aria-label={`Increase ${item.name}`}
            className="btn h-14 w-14 shrink-0 bg-neutral-900 p-0 text-2xl font-bold text-white hover:bg-neutral-800 disabled:opacity-40"
          >
            +
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`Delete ${item.name}`}
            title="Delete item"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-red-500/40 bg-white text-red-600/45 transition-opacity hover:border-red-500/70 hover:bg-red-50 hover:text-red-600/70 active:opacity-80 disabled:opacity-30"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
