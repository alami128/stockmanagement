import ItemIcon from "@/components/ItemIcon";
import { CATEGORY_LABEL, groupItemsByCategory, isItemCategory } from "@/lib/categories";
import { formatQuantity, getStockStatus, unitCaption } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default function OrderSheetList({ items }: { items: Item[] }) {
  const normalized = items.map((item) => ({
    ...item,
    category: isItemCategory(item.category) ? item.category : "other",
  }));

  const groups = groupItemsByCategory(normalized).filter(
    (g) => g.category !== "cleaning"
  );

  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No items on the order list yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(({ category, items: groupItems }) => (
        <section key={category}>
          <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
            {CATEGORY_LABEL[category]}
          </h2>
          <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {groupItems.map((item) => {
              const status = getStockStatus(item);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <ItemIcon
                    name={item.name}
                    unit={item.unit}
                    status={status}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {unitCaption(item.unit)}
                    </p>
                  </div>
                  <p className="text-base font-semibold tabular-nums text-neutral-900">
                    {formatQuantity(item.quantity, item.unit)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
