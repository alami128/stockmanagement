"use client";

import { useState, useTransition } from "react";
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
  const step = STOCK_STEP[item.unit];
  const status = getStockStatus({ quantity, low_stock_threshold: item.low_stock_threshold });

  function commit(next: number) {
    const safe = Math.max(0, Math.round(next / step) * step);
    setQuantity(safe);
    startTransition(() => {
      setItemQuantity(item.id, safe);
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xl font-semibold text-gray-900">{item.name}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STOCK_STATUS_BADGE[status]}`}
        >
          {STOCK_STATUS_LABEL[status]}
        </span>
      </div>

      {/* Stock level bar, relative to the low-stock threshold */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
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
          className="btn h-14 w-14 shrink-0 bg-gray-100 p-0 text-2xl font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
        >
          −
        </button>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {formatQuantity(quantity, item.unit)}
          </p>
          <p className="text-xs text-gray-400">
            reorder below {formatQuantity(item.low_stock_threshold, item.unit)}
          </p>
        </div>

        <button
          onClick={() => commit(quantity + step)}
          disabled={isPending}
          aria-label={`Increase ${item.name}`}
          className="btn h-14 w-14 shrink-0 bg-gray-900 p-0 text-2xl font-bold text-white hover:bg-gray-800 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
