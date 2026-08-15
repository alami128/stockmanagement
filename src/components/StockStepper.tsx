"use client";

import { useState, useTransition } from "react";
import ItemIcon from "@/components/ItemIcon";
import { setItemQuantity } from "@/lib/actions/items";
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

  return (
    <div className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ItemIcon
            name={item.name}
            unit={item.unit}
            status={status}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-stone-900">
              {item.name}
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
              {item.unit === "pcs"
                ? "Pieces"
                : item.unit === "bottle"
                  ? "Bottles"
                  : item.unit}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${STOCK_STATUS_BADGE[status]}`}
        >
          {STOCK_STATUS_LABEL[status]}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
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

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          onClick={() => commit(quantity - step)}
          disabled={isPending || quantity <= 0}
          aria-label={`Decrease ${item.name}`}
          className="btn h-14 w-14 shrink-0 bg-stone-100 p-0 text-2xl font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-40"
        >
          −
        </button>

        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums text-stone-900">
            {formatQuantity(quantity, item.unit)}
          </p>
          <p className="text-xs text-stone-400">
            reorder below {formatQuantity(item.low_stock_threshold, item.unit)}
          </p>
        </div>

        <button
          onClick={() => commit(quantity + step)}
          disabled={isPending}
          aria-label={`Increase ${item.name}`}
          className="btn h-14 w-14 shrink-0 bg-stone-900 p-0 text-2xl font-bold text-white hover:bg-stone-800 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
