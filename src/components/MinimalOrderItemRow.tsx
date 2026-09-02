"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ItemIcon from "@/components/ItemIcon";
import { toggleOrderNeed } from "@/lib/actions/order-needs";
import { setItemQuantity } from "@/lib/actions/items";
import { CATEGORY_LABEL } from "@/lib/categories";
import { getStockStatus, STOCK_STEP } from "@/lib/stock";
import type { Item } from "@/lib/types";

function formatCount(quantity: number, step: number) {
  if (Number.isInteger(quantity) || step >= 1) return String(quantity);
  return quantity.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default function MinimalOrderItemRow({
  item,
  flaggedForOrder = false,
}: {
  item: Item;
  flaggedForOrder?: boolean;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [flagged, setFlagged] = useState(flaggedForOrder);
  const [pulse, setPulse] = useState(false);
  const [isPending, startTransition] = useTransition();
  const step = STOCK_STEP[item.unit] ?? 1;
  const quantityRef = useRef(quantity);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatus = useRef(
    getStockStatus({
      quantity: item.quantity,
      low_stock_threshold: item.low_stock_threshold,
    })
  );

  useEffect(() => {
    setQuantity(item.quantity);
    quantityRef.current = item.quantity;
  }, [item.id, item.quantity, item.updated_at]);

  useEffect(() => {
    setFlagged(flaggedForOrder);
  }, [flaggedForOrder]);

  const status = getStockStatus({
    quantity,
    low_stock_threshold: item.low_stock_threshold,
  });
  const needsAttention = status !== "available";

  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    const was = prevStatus.current;
    prevStatus.current = status;
    if (was !== "available" && status === "available") {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 450);
      return () => clearTimeout(t);
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleSave(next: number) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      startTransition(() => {
        setItemQuantity(item.id, next);
      });
    }, 180);
  }

  function bump(delta: number) {
    const next = Math.max(
      0,
      Math.round((quantityRef.current + delta) / step) * step
    );
    quantityRef.current = next;
    setQuantity(next);
    scheduleSave(next);
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
      className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 shadow-sm ring-1 transition-[background-color,box-shadow,ring-color,transform] duration-300 ease-out ${
        status === "available"
          ? "bg-green-50 ring-green-200"
          : "bg-white ring-black/[0.04]"
      } ${pulse ? "scale-[1.015] shadow-md ring-2 ring-green-300" : ""}`}
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
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition duration-200 ${
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
          onClick={() => bump(-step)}
          disabled={quantity <= 0}
          aria-label={`Decrease ${item.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg font-medium text-neutral-700 ring-1 ring-black/[0.06] transition active:scale-90 disabled:opacity-35"
        >
          −
        </button>

        <div
          className={`flex h-10 min-w-[2.75rem] items-center justify-center rounded-full px-2 transition-colors duration-300 ${
            status === "available" ? "bg-green-100" : "bg-neutral-100"
          }`}
          aria-live="polite"
        >
          <span
            key={quantity}
            className="animate-[fadeCount_160ms_ease-out] text-sm font-semibold tabular-nums text-neutral-800"
          >
            {formatCount(quantity, step)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => bump(step)}
          aria-label={`Increase ${item.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg font-medium text-neutral-700 ring-1 ring-black/[0.06] transition active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}
