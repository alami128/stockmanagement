"use client";

import { useState, useTransition } from "react";
import {
  addCustomPrep,
  removePrepSelection,
  togglePrepDone,
  togglePrepSelection,
} from "@/lib/actions/preps";
import type { PrepItem, PrepSelection } from "@/lib/types";

type SelectionRow = PrepSelection & {
  users?: { name: string } | null;
};

export default function ChefPrepPanel({
  menuItems,
  selections,
  sections,
}: {
  menuItems: PrepItem[];
  selections: SelectionRow[];
  sections: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedMenuIds = new Set(
    selections
      .filter((s) => s.prep_item_id)
      .map((s) => s.prep_item_id as string)
  );

  const pending = selections.filter((s) => !s.done);
  const done = selections.filter((s) => s.done);

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else setCustomName("");
    });
  }

  return (
    <div className={`space-y-8 ${isPending ? "opacity-70" : ""}`}>
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
          Add a prep
        </h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addCustomPrep(customName));
          }}
        >
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Prep burger buns"
            className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-neutral-400"
          />
          <button
            type="submit"
            disabled={isPending || !customName.trim()}
            className="shrink-0 rounded-xl border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </section>

      {menuItems.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
            From the menu
          </h2>
          <div className="space-y-6">
            {sections.map((section) => {
              const sectionItems = menuItems.filter(
                (item) => item.section === section
              );
              if (sectionItems.length === 0) return null;

              return (
                <div key={section}>
                  <h3 className="mb-2 text-sm font-medium text-neutral-500">
                    {section}
                  </h3>
                  <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {sectionItems.map((item) => {
                      const isSelected = selectedMenuIds.has(item.id);
                      return (
                        <li key={item.id}>
                          <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5 hover:bg-neutral-50">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isPending}
                              onChange={(e) =>
                                run(() =>
                                  togglePrepSelection(item.id, e.target.checked)
                                )
                              }
                              className="h-5 w-5 shrink-0 accent-neutral-900"
                            />
                            <span className="flex-1 text-base font-medium text-neutral-900">
                              {item.name}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
          Today&apos;s preps
        </h2>
        {selections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
            No preps added yet. Pick from the menu or add one above.
          </p>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <PrepSelectionList
                title="To do"
                items={pending}
                isPending={isPending}
                onToggleDone={(id, done) => run(() => togglePrepDone(id, done))}
                onRemove={(id) => run(() => removePrepSelection(id))}
              />
            )}
            {done.length > 0 && (
              <PrepSelectionList
                title="Done"
                items={done}
                isPending={isPending}
                done
                onToggleDone={(id, done) => run(() => togglePrepDone(id, done))}
                onRemove={(id) => run(() => removePrepSelection(id))}
              />
            )}
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function PrepSelectionList({
  title,
  items,
  isPending,
  done = false,
  onToggleDone,
  onRemove,
}: {
  title: string;
  items: SelectionRow[];
  isPending: boolean;
  done?: boolean;
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <h3
        className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          done
            ? "border-2 border-green-500 text-green-700"
            : "border-2 border-yellow-500 text-yellow-700"
        }`}
      >
        {title}
      </h3>
      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {items.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-4 py-3.5">
            <input
              type="checkbox"
              checked={row.done}
              disabled={isPending}
              onChange={(e) => onToggleDone(row.id, e.target.checked)}
              className="h-5 w-5 shrink-0 accent-neutral-900"
              aria-label={`Mark ${row.name} done`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`font-medium ${
                  row.done ? "text-neutral-400 line-through" : "text-neutral-900"
                }`}
              >
                {row.name}
              </p>
              <p className="text-xs text-neutral-400">{row.section}</p>
            </div>
            {!row.done && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onRemove(row.id)}
                className="shrink-0 text-xs font-medium text-neutral-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
