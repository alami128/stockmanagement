import type { PrepItem, PrepSelection } from "@/lib/types";

export default function HeadChefPrepView({
  items,
  selections,
}: {
  items: PrepItem[];
  selections: (PrepSelection & {
    prep_items: Pick<PrepItem, "name" | "section"> | null;
    users: { name: string } | null;
  })[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No prep items on the menu yet.
      </p>
    );
  }

  if (selections.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No preps selected for today. Chefs will mark items here when needed.
      </p>
    );
  }

  const bySection = new Map<string, typeof selections>();
  for (const row of selections) {
    const section = row.prep_items?.section || "Menu";
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section)!.push(row);
  }

  const sections = [...bySection.keys()].sort();

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section}>
          <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
            {section}
          </h2>
          <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {bySection.get(section)!.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">
                    {row.prep_items?.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Marked by {row.users?.name || "Chef"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border-2 border-yellow-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-yellow-700">
                  To prep
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
