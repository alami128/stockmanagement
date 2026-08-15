import {
  getStockStatus,
  STOCK_STATUS_LABEL,
  formatQuantity,
} from "@/lib/stock";
import type { Item, StockStatus } from "@/lib/types";

const SECTION_ORDER: StockStatus[] = ["needs_order", "low", "available"];

const SECTION_STYLE: Record<
  StockStatus,
  { heading: string; dot: string; card: string }
> = {
  needs_order: {
    heading: "text-red-700",
    dot: "bg-unavailable",
    card: "border-red-100",
  },
  low: {
    heading: "text-amber-700",
    dot: "bg-amber-500",
    card: "border-amber-100",
  },
  available: {
    heading: "text-green-700",
    dot: "bg-available",
    card: "border-green-100",
  },
};

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
      <p className="rounded-2xl bg-white p-5 text-gray-500 shadow-sm">
        No items yet. Ask an admin to add some.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {SECTION_ORDER.map((status) => {
        const sectionItems = grouped[status];
        if (sectionItems.length === 0) return null;
        const style = SECTION_STYLE[status];

        return (
          <section key={status}>
            <h2
              className={`mb-3 flex items-center gap-2 text-lg font-bold ${style.heading}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
              {STOCK_STATUS_LABEL[status]}
              <span className="font-normal text-gray-400">
                ({sectionItems.length})
              </span>
            </h2>
            <div className="space-y-2">
              {sectionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm ${style.card}`}
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </span>
                  <span className="text-lg font-medium text-gray-600">
                    {formatQuantity(item.quantity, item.unit)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
