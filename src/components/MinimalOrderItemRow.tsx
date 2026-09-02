"use client";

import { useState, useTransition } from "react";
import ItemIcon from "@/components/ItemIcon";
import { toggleOrderNeed } from "@/lib/actions/order-needs";
import { setItemQuantity } from "@/lib/actions/items";
import { CATEGORY_LABEL } from "@/lib/categories";
import {
  getStockStatus,
  STOCK_STEP,
  formatQuantity,
} from "@/lib/stock";
import type { Item } from "@/lib/types";

export default function MinimalOrderItemRow({
  item,
  flaggedForOrder = false,
}: {
  item: Item;
  flaggedForOrder?: boolean;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [flagged, setFlagged] = useState(flaggedForOrder);
  const [isPending, startTransition] = useTransition();
  const step = STOCK_STEP[item.unit] ?? 1;
  const status = getStockStatus({
    quantity,
    low_stock_threshold: item.low_stock_threshold,
  });
  const needsAttention = status !== "available";

  function commit(next: number) {
    const safe = Math.max(0, Math.round(next / step) * step);
    setQuantity(safe);
    startTransition(() => {
      setItemQuantity(item.id, safe);
    });
  }

  function handleToggleFlag() {
    const next = !flagged;
    setFlagged(next);
    startTransition(async () => {
      const result = await toggleOrderNeed(item.id, next);
      if (result.error) {
        setFlagged(!next);
        window.alert(result.error);
      }
    });
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-sm ring-1 ring-black/[0.04] ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <ItemIcon
        name={item.name}
        unit={item.unit}
        status={status}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-neutral-900">
          {item.name}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {CATEGORY_LABEL[item.category]}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggleFlag}
        disabled={isPending}
        aria-pressed={flagged}
        aria-label={
          flagged
            ? `Unflag ${item.name} for head chef`
            : `Flag ${item.name} for head chef`
        }
        title={flagged ? "Flagged for head chef" : "Flag for head chef"}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
          flagged
            ? "bg-neutral-900 text-white"
            : needsAttention
              ? "bg-neutral-100 text-neutral-600"
              : "bg-transparent text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500"
        }`}
      >
        !
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => commit(quantity - step)}
          disabled={isPending || quantity <= 0}
          aria-label={`Decrease ${item.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg font-medium text-neutral-700 transition active:scale-95 disabled:opacity-35"
        >
          −
        </button>

        <div
          className="flex h-10 min-w-[2.75rem] items-center justify-center rounded-full bg-neutral-100 px-2"
          aria-live="polite"
        >
          <span className="text-sm font-semibold tabular-nums text-neutral-800">
            {formatQuantity(quantity, item.unit).replace(/\s.+$/, "")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => commit(quantity + step)}
          disabled={isPending}
          aria-label={`Increase ${item.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg font-medium text-neutral-700 transition active:scale-95 disabled:opacity-35"
        >
          +
        </button>
      </div>
    </div>
  );
}
