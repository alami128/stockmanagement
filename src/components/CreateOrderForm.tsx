"use client";

import { useState, useTransition } from "react";
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
        // NEXT_REDIRECT is thrown by redirect() on success - ignore it.
        if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
          setError(e.message);
        }
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-5 text-gray-500 shadow-sm">
        Nothing needs ordering right now. Everything is stocked above its
        reorder point.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const line = lines[item.id];
        const status = getStockStatus(item);
        return (
          <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <label className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={line.selected}
                onChange={(e) =>
                  update(item.id, { selected: e.target.checked })
                }
                className="mt-2 h-6 w-6 accent-orange-600"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xl font-semibold text-gray-900">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatQuantity(item.quantity, item.unit)} left
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STOCK_STATUS_BADGE[status]}`}
                    >
                      {STOCK_STATUS_LABEL[status]}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder={`Quantity to order (${item.unit})`}
                    value={line.quantity}
                    onChange={(e) =>
                      update(item.id, {
                        quantity: e.target.value,
                        selected: e.target.value !== "" || line.selected,
                      })
                    }
                    className="rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={line.notes}
                    onChange={(e) => update(item.id, { notes: e.target.value })}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </label>
          </div>
        );
      })}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={isPending}
        className="btn w-full bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {isPending ? "Creating order..." : "Create order"}
      </button>
    </div>
  );
}
