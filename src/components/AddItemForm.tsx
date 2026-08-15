"use client";

import { useRef, useState, useTransition } from "react";
import { addItem } from "@/lib/actions/items";
import { CATEGORY_LABEL, ITEM_CATEGORIES } from "@/lib/categories";

export default function AddItemForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await addItem(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          formRef.current?.reset();
        });
      }}
      className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-4"
    >
      <input
        name="name"
        placeholder="Item name (e.g. Basil)"
        required
        className="col-span-2 rounded-xl border border-neutral-200 px-4 py-3 text-lg outline-none focus:border-neutral-400 sm:col-span-4"
      />
      <div className="col-span-2 sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Category
        </label>
        <select
          name="category"
          defaultValue="other"
          className="w-full rounded-xl border border-neutral-200 px-3 py-3 outline-none focus:border-neutral-400"
        >
          {ITEM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABEL[cat]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Starting amount
        </label>
        <input
          name="quantity"
          type="number"
          min="0"
          step="any"
          defaultValue="0"
          className="w-full rounded-xl border border-neutral-200 px-3 py-3 outline-none focus:border-neutral-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Unit
        </label>
        <select
          name="unit"
          defaultValue="pcs"
          className="w-full rounded-xl border border-neutral-200 px-3 py-3 outline-none focus:border-neutral-400"
        >
          <option value="pcs">pcs</option>
          <option value="bottle">bottle</option>
          <option value="bags">bags</option>
          <option value="packets">packets</option>
          <option value="boxes">boxes</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="ml">ml</option>
        </select>
      </div>
      <div className="col-span-2 sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Reorder below
        </label>
        <input
          name="low_stock_threshold"
          type="number"
          min="0"
          step="any"
          defaultValue="5"
          className="w-full rounded-xl border border-neutral-200 px-3 py-3 outline-none focus:border-neutral-400"
        />
      </div>
      {error && (
        <p className="col-span-2 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 sm:col-span-4">
          {error}
        </p>
      )}
      <div className="col-span-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add item"}
        </button>
      </div>
    </form>
  );
}
