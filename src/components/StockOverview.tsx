import ItemIcon from "@/components/ItemIcon";
import {
  getStockStatus,
  STOCK_STATUS_LABEL,
  STOCK_STATUS_BADGE,
  formatQuantity,
} from "@/lib/stock";
import type { Item, StockStatus } from "@/lib/types";

const SECTION_ORDER: StockStatus[] = ["needs_order", "low", "available"];

export default function StockOverview({ items }: { items: Item[] }) {
  const grouped: Record<StockStatus, Item[]> = {
    needs_order: [],
    low: [],
    available: [],
  };

  for (const item of items) {
    grouped[getStockStatus(item)].push(item);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No items yet. Ask an admin to add some.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {SECTION_ORDER.map((status) => {
        const sectionItems = grouped[status];
        if (sectionItems.length === 0) return null;

        return (
          <section key={status}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2
                className={`inline-flex items-center rounded-full px-3.5 py-1.5 font-display text-sm font-semibold tracking-tight ${STOCK_STATUS_BADGE[status]}`}
              >
                {STOCK_STATUS_LABEL[status]}
              </h2>
              <span className="text-sm text-neutral-400">
                {sectionItems.length}
              </span>
            </div>

            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {sectionItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-3.5 py-3"
                >
                  <ItemIcon name={item.name} unit={item.unit} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {item.unit === "pcs"
                        ? "Pieces"
                        : item.unit === "bottle"
                          ? "Bottles"
                          : item.unit}
                    </p>
                  </div>
                  <p className="text-base font-semibold tabular-nums text-neutral-900">
                    {formatQuantity(item.quantity, item.unit)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
