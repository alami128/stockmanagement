"use client";

import { useState, useTransition } from "react";
import ItemIcon from "@/components/ItemIcon";
import { createOrder } from "@/lib/actions/orders";
import {
  getStockStatus,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABEL,
  formatQuantity,
} from "@/lib/stock";
import type { Item } from "@/lib/types";

interface Line {
  selected: boolean;
  quantity: string;
  notes: string;
}

export default function CreateOrderForm({ items }: { items: Item[] }) {
  const [lines, setLines] = useState<Record<string, Line>>(() =>
    Object.fromEntries(
      items.map((i) => [i.id, { selected: false, quantity: "", notes: "" }])
    )
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function update(id: string, patch: Partial<Line>) {
    setLines((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  const selectedCount = items.filter((i) => lines[i.id]?.selected).length;

  function submit() {
    setError(null);
    const orderLines = items
      .filter((i) => lines[i.id]?.selected)
      .map((i) => ({
        itemId: i.id,
        quantity: parseFloat(lines[i.id].quantity) || 0,
        notes: lines[i.id].notes || undefined,
      }))
      .filter((l) => l.quantity > 0);

    if (orderLines.length === 0) {
      setError("Select at least one item and enter a quantity.");
      return;
    }

    startTransition(async () => {
      try {
        await createOrder(orderLines);
      } catch (e) {
        if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
          setError(e.message);
        }
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/60 px-5 py-10 text-center text-emerald-800">
        Nothing needs ordering right now. Everything is stocked above its
        reorder point.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const line = lines[item.id];
        const status = getStockStatus(item);
        const unitHint =
          item.unit === "pcs"
            ? "pcs"
            : item.unit === "bottle"
              ? "bottles"
              : item.unit;

        return (
          <div
            key={item.id}
            className={`stock-row overflow-hidden rounded-2xl border bg-white/95 shadow-[0_1px_0_rgba(28,25,23,0.04)] backdrop-blur transition ${
              line.selected
                ? "border-orange-300 ring-2 ring-orange-100"
                : "border-white/80"
            }`}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="flex items-start gap-4 p-4 sm:p-5">
              <input
                type="checkbox"
                checked={line.selected}
                onChange={(e) =>
                  update(item.id, { selected: e.target.checked })
                }
                className="mt-3 h-6 w-6 accent-orange-600"
                aria-label={`Select ${item.name}`}
              />
              <button
                type="button"
                onClick={() => update(item.id, { selected: !line.selected })}
                className="shrink-0"
                tabIndex={-1}
                aria-hidden
              >
                <ItemIcon
                  name={item.name}
                  unit={item.unit}
                  status={status}
                  size="lg"
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      update(item.id, { selected: !line.selected })
                    }
                    className="text-left"
                  >
                    <p className="font-display text-xl font-semibold tracking-tight text-stone-900">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {formatQuantity(item.quantity, item.unit)} left
                    </p>
                  </button>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${STOCK_STATUS_BADGE[status]}`}
                  >
                    {STOCK_STATUS_LABEL[status]}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                      Order qty ({unitHint})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder={
                        item.unit === "bottle"
                          ? "e.g. 6 bottles"
                          : item.unit === "pcs"
                            ? "e.g. 24 pcs"
                            : `Quantity (${item.unit})`
                      }
                      value={line.quantity}
                      onChange={(e) =>
                        update(item.id, {
                          quantity: e.target.value,
                          selected: e.target.value !== "" || line.selected,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-lg text-stone-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                      Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={line.notes}
                      onChange={(e) =>
                        update(item.id, { notes: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-lg text-stone-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={isPending}
        className="btn group relative w-full overflow-hidden bg-gradient-to-r from-orange-600 to-rose-500 text-white shadow-[0_16px_40px_-20px_rgba(234,88,12,0.9)] hover:from-orange-500 hover:to-rose-400 disabled:opacity-60"
      >
        <span className="relative z-10">
          {isPending
            ? "Creating order..."
            : selectedCount > 0
              ? `Create order · ${selectedCount} item${selectedCount === 1 ? "" : "s"}`
              : "Create order"}
        </span>
      </button>
    </div>
  );
}
