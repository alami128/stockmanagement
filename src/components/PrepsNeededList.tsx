import Link from "next/link";
import ItemIcon from "@/components/ItemIcon";
import {
  getStockStatus,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABEL,
  formatQuantity,
} from "@/lib/stock";
import type { Item } from "@/lib/types";

export default function PrepsNeededList({ items }: { items: Item[] }) {
  const prepItems = items
    .filter((item) => getStockStatus(item) !== "available")
    .sort((a, b) => {
      const order = { needs_order: 0, low: 1, available: 2 } as const;
      return order[getStockStatus(a)] - order[getStockStatus(b)];
    });

  if (prepItems.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        Nothing urgent right now — stock is above reorder levels.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {prepItems.map((item) => {
        const status = getStockStatus(item);
        return (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3.5">
            <ItemIcon
              name={item.name}
              unit={item.unit}
              status={status}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900">{item.name}</p>
              <p className="text-sm text-neutral-500">
                {formatQuantity(item.quantity, item.unit)} on hand
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STOCK_STATUS_BADGE[status]}`}
            >
              {STOCK_STATUS_LABEL[status]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
