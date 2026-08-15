"use client";

import { useState, useTransition } from "react";
import { renameItem, removeItem, updateItemSettings } from "@/lib/actions/items";
import { CATEGORY_LABEL, ITEM_CATEGORIES } from "@/lib/categories";
import { formatQuantity } from "@/lib/stock";
import type { Item, ItemCategory, StockUnit } from "@/lib/types";

const UNITS: StockUnit[] = ["pcs", "bottle", "bags", "packets", "kg", "g", "L", "ml"];

export default function ManageItemsList({ items }: { items: Item[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            {editingId === item.id ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    startTransition(() => renameItem(item.id, draftName));
                    setEditingId(null);
                  }
                }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
              />
            ) : (
              <div>
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="ml-2 text-sm text-gray-400">
                  {formatQuantity(item.quantity, item.unit)} on hand
                </span>
                <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  {CATEGORY_LABEL[item.category] || "Other"}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {editingId === item.id ? (
                <button
                  onClick={() => {
                    startTransition(() => renameItem(item.id, draftName));
                    setEditingId(null);
                  }}
                  disabled={isPending}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setDraftName(item.name);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Rename
                </button>
              )}
              <button
                onClick={() => startTransition(() => removeItem(item.id))}
                disabled={isPending}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Category
              <select
                defaultValue={item.category || "other"}
                disabled={isPending}
                onChange={(e) =>
                  startTransition(() =>
                    updateItemSettings(
                      item.id,
                      item.unit,
                      item.low_stock_threshold,
                      e.target.value as ItemCategory
                    )
                  )
                }
                className="rounded-lg border border-gray-300 px-2 py-1"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Unit
              <select
                defaultValue={item.unit}
                disabled={isPending}
                onChange={(e) =>
                  startTransition(() =>
                    updateItemSettings(
                      item.id,
                      e.target.value as StockUnit,
                      item.low_stock_threshold,
                      item.category
                    )
                  )
                }
                className="rounded-lg border border-gray-300 px-2 py-1"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Reorder below
              <input
                type="number"
                min="0"
                step="any"
                defaultValue={item.low_stock_threshold}
                disabled={isPending}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (Number.isFinite(val)) {
                    startTransition(() =>
                      updateItemSettings(
                        item.id,
                        item.unit,
                        val,
                        item.category
                      )
                    );
                  }
                }}
                className="w-20 rounded-lg border border-gray-300 px-2 py-1"
              />
              {item.unit}
            </label>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-4 text-neutral-500">
          No items yet.
        </p>
      )}
    </div>
  );
}
