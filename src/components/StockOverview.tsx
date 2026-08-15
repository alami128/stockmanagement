import ItemIcon from "@/components/ItemIcon";
import {
  getStockStatus,
  STOCK_STATUS_LABEL,
  formatQuantity,
} from "@/lib/stock";
import type { Item, StockStatus } from "@/lib/types";

const SECTION_ORDER: StockStatus[] = ["needs_order", "low", "available"];

const SECTION_STYLE: Record<
  StockStatus,
  {
    heading: string;
    accent: string;
    card: string;
    qty: string;
    hint: string;
  }
> = {
  needs_order: {
    heading: "text-rose-700",
    accent: "from-rose-500 to-orange-400",
    card: "hover:border-rose-200/80",
    qty: "text-rose-700",
    hint: "Needs restock",
  },
  low: {
    heading: "text-amber-700",
    accent: "from-amber-400 to-orange-300",
    card: "hover:border-amber-200/80",
    qty: "text-amber-700",
    hint: "Running thin",
  },
  available: {
    heading: "text-emerald-700",
    accent: "from-emerald-400 to-teal-300",
    card: "hover:border-emerald-200/80",
    qty: "text-emerald-700",
    hint: "On hand",
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
      <p className="rounded-3xl border border-dashed border-stone-300/80 bg-white/70 px-5 py-8 text-center text-stone-500 backdrop-blur">
        No items yet. Ask an admin to add some.
      </p>
    );
  }

  return (
    <div className="space-y-9">
      {SECTION_ORDER.map((status, sectionIndex) => {
        const sectionItems = grouped[status];
        if (sectionItems.length === 0) return null;
        const style = SECTION_STYLE[status];

        return (
          <section
            key={status}
            className="stock-section"
            style={{ animationDelay: `${sectionIndex * 80}ms` }}
          >
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2
                className={`flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight ${style.heading}`}
              >
                <span
                  className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${style.accent}`}
                />
                {STOCK_STATUS_LABEL[status]}
              </h2>
              <span className="text-sm font-medium text-stone-400">
                {sectionItems.length}{" "}
                {sectionItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="grid gap-2.5 sm:grid-cols-2">
              {sectionItems.map((item, i) => (
                <li
                  key={item.id}
                  className={`stock-row group flex items-center gap-3.5 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-[0_1px_0_rgba(28,25,23,0.04)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(28,25,23,0.35)] ${style.card}`}
                  style={{ animationDelay: `${sectionIndex * 80 + i * 40}ms` }}
                >
                  <ItemIcon
                    name={item.name}
                    unit={item.unit}
                    status={status}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-900">
                      {item.name}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                      {item.unit === "pcs"
                        ? "Pieces"
                        : item.unit === "bottle"
                          ? "Bottles"
                          : item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold tabular-nums ${style.qty}`}>
                      {formatQuantity(item.quantity, item.unit)}
                    </p>
                    <p className="text-[11px] font-medium text-stone-400">
                      {style.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
