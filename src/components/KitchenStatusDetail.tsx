import ItemIcon from "@/components/ItemIcon";
import {
  getStockStatus,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABEL,
  formatQuantity,
} from "@/lib/stock";
import type { Item } from "@/lib/types";

function ItemRow({ item }: { item: Item }) {
  const status = getStockStatus(item);
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <ItemIcon name={item.name} unit={item.unit} status={status} size="md" />
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
}

export default function KitchenStatusDetail({ items }: { items: Item[] }) {
  const cleaningItems = items.filter((i) => i.category === "cleaning");
  const needsAttention = cleaningItems.filter(
    (i) => getStockStatus(i) !== "available"
  );
  const stocked = cleaningItems.filter(
    (i) => getStockStatus(i) === "available"
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
          Needs repair or cleaning
        </h2>
        {needsAttention.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
            All cleaning supplies are stocked. No urgent maintenance items.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {needsAttention.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
          Cleaning supplies
        </h2>
        {cleaningItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
            No cleaning items yet. Ask admin to add them.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {stocked.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
            {stocked.length === 0 && needsAttention.length > 0 && (
              <li className="px-4 py-5 text-sm text-neutral-500">
                Everything in cleaning is out or running low.
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
