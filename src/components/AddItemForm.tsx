"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { addItem } from "@/lib/actions/items";
import { CATEGORY_LABEL, ITEM_CATEGORIES } from "@/lib/categories";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add item"}
    </button>
  );
}

export default function AddItemForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addItem(formData);
        formRef.current?.reset();
      }}
      className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-4"
    >
      <input
        name="name"
        placeholder="Item name (e.g. Basil)"
        required
        className="col-span-2 rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:col-span-4"
      />
      <div className="col-span-2 sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Category
        </label>
        <select
          name="category"
          defaultValue="other"
          className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {ITEM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABEL[cat]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Starting amount
        </label>
        <input
          name="quantity"
          type="number"
          min="0"
          step="any"
          defaultValue="0"
          className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Unit
        </label>
        <select
          name="unit"
          defaultValue="pcs"
          className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="pcs">pcs</option>
          <option value="bottle">bottle</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="ml">ml</option>
        </select>
      </div>
      <div className="col-span-2 sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Reorder below
        </label>
        <input
          name="low_stock_threshold"
          type="number"
          min="0"
          step="any"
          defaultValue="5"
          className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="col-span-2 sm:col-span-2">
        <AddButton />
      </div>
    </form>
  );
}
