"use client";

import { useTransition } from "react";
import { togglePrepSelection } from "@/lib/actions/preps";
import type { PrepItem } from "@/lib/types";

export default function ChefPrepPicker({
  items,
  selectedIds,
  sections,
}: {
  items: PrepItem[];
  selectedIds: string[];
  sections: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const selected = new Set(selectedIds);

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No prep items on the menu yet. Share the menu and we&apos;ll add them
        here.
      </p>
    );
  }

  return (
    <div className={`space-y-6 ${isPending ? "opacity-70" : ""}`}>
      {sections.map((section) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (sectionItems.length === 0) return null;

        return (
          <section key={section}>
            <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
              {section}
            </h2>
            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {sectionItems.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-center gap-4 px-4 py-4 hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isPending}
                        onChange={(e) =>
                          startTransition(async () => {
                            await togglePrepSelection(item.id, e.target.checked);
                          })
                        }
                        className="h-5 w-5 shrink-0 accent-neutral-900"
                      />
                      <span
                        className={`flex-1 text-base font-medium ${
                          isSelected ? "text-neutral-900" : "text-neutral-600"
                        }`}
                      >
                        {item.name}
                      </span>
                      {isSelected && (
                        <span className="rounded-full border-2 border-yellow-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-yellow-700">
                          To prep
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
