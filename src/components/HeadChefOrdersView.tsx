import ItemIcon from "@/components/ItemIcon";
import {
  HeadChefCategoryBlock,
  HeadChefEmptyState,
  HeadChefProgressBar,
  HeadChefSectionGroup,
  HeadChefSubsection,
  HeadChefSummaryGrid,
} from "@/components/HeadChefOverviewUI";
import { CATEGORY_LABEL } from "@/lib/categories";
import {
  formatQuantity,
  getStockStatus,
  STOCK_STATUS_LABEL,
  unitCaption,
} from "@/lib/stock";
import type { Item, ItemCategory, StockStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  StockStatus,
  {
    icon: string;
    title: string;
    description: string;
    accent: string;
    tone: "red" | "amber" | "green";
    subsectionTitle: string;
    emptyMessage: string;
  }
> = {
  needs_order: {
    icon: "🚨",
    title: "Out of stock",
    description: "Items at zero — order these first.",
    accent: "border-l-4 border-l-red-400",
    tone: "red",
    subsectionTitle: "Needs ordering now",
    emptyMessage: "Nothing is completely out of stock.",
  },
  low: {
    icon: "⚠️",
    title: "Running low",
    description: "Stock is below the reorder level — plan ahead.",
    accent: "border-l-4 border-l-amber-400",
    tone: "amber",
    subsectionTitle: "Reorder soon",
    emptyMessage: "Nothing is running low right now.",
  },
  available: {
    icon: "✅",
    title: "In stock",
    description: "Items above reorder levels.",
    accent: "border-l-4 border-l-green-400",
    tone: "green",
    subsectionTitle: "Adequately stocked",
    emptyMessage: "No items in this group.",
  },
};

export default function HeadChefOrdersView({ items }: { items: Item[] }) {
  const grouped: Record<StockStatus, Item[]> = {
    needs_order: [],
    low: [],
    available: [],
  };

  for (const item of items) {
    grouped[getStockStatus(item)].push(item);
  }

  const outOfStock = grouped.needs_order;
  const runningLow = grouped.low;
  const inStock = grouped.available;
  const alertCount = outOfStock.length + runningLow.length;
  const categoryCount = new Set(
    [...outOfStock, ...runningLow].map((i) => i.category)
  ).size;

  if (items.length === 0) {
    return (
      <HeadChefEmptyState
        icon="📦"
        title="No stock items yet"
        message="Ask an admin to add kitchen items. Once stock is tracked, low and out-of-stock alerts will show here."
      />
    );
  }

  if (alertCount === 0) {
    return (
      <div className="space-y-6">
        <HeadChefSummaryGrid
          stats={[
            { label: "Out of stock", value: 0, tone: "red" },
            { label: "Running low", value: 0, tone: "amber" },
            { label: "In stock", value: inStock.length, tone: "green" },
            { label: "Tracked", value: items.length, tone: "neutral" },
          ]}
        />
        <HeadChefEmptyState
          icon="✅"
          title="Stock looks healthy"
          message="Nothing is out or running low. Chefs will flag items here when stock drops."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeadChefSummaryGrid
        stats={[
          { label: "Out of stock", value: outOfStock.length, tone: "red" },
          { label: "Running low", value: runningLow.length, tone: "amber" },
          { label: "In stock", value: inStock.length, tone: "green" },
          { label: "Categories", value: categoryCount, tone: "neutral" },
        ]}
      />

      <HeadChefProgressBar
        done={inStock.length}
        total={items.length}
        label="Stock coverage"
        detailLabel={`${inStock.length} of ${items.length} items adequately stocked`}
        barClassName="bg-green-500"
      />

      {(["needs_order", "low"] as const).map((status) => {
        const config = STATUS_CONFIG[status];
        const statusItems = grouped[status];
        if (statusItems.length === 0) return null;

        const byCategory = groupByCategory(statusItems);

        return (
          <HeadChefCategoryBlock
            key={status}
            icon={config.icon}
            title={config.title}
            description={config.description}
            accentClass={config.accent}
          >
            <HeadChefSubsection
              title={config.subsectionTitle}
              count={statusItems.length}
              tone={config.tone}
              emptyMessage={config.emptyMessage}
            >
              {Object.entries(byCategory).map(([category, categoryItems]) => (
                <HeadChefSectionGroup
                  key={category}
                  sectionName={CATEGORY_LABEL[category as ItemCategory] || category}
                  count={categoryItems.length}
                >
                  {categoryItems.map((item) => (
                    <StockItemCard
                      key={item.id}
                      item={item}
                      status={status}
                      tone={config.tone}
                    />
                  ))}
                </HeadChefSectionGroup>
              ))}
            </HeadChefSubsection>
          </HeadChefCategoryBlock>
        );
      })}
    </div>
  );
}

function StockItemCard({
  item,
  status,
  tone,
}: {
  item: Item;
  status: StockStatus;
  tone: "red" | "amber" | "green";
}) {
  const colors = {
    red: "bg-red-50 text-red-800 ring-red-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    green: "bg-green-50 text-green-800 ring-green-200",
  }[tone];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3.5 sm:flex sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ItemIcon
          name={item.name}
          unit={item.unit}
          status={status}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium leading-snug text-neutral-900">
            {item.name}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {unitCaption(item.unit)} · reorder at {item.low_stock_threshold}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end">
        <p className="font-display text-lg font-semibold tabular-nums text-neutral-900">
          {formatQuantity(item.quantity, item.unit)}
        </p>
        <span
          className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${colors}`}
        >
          {STOCK_STATUS_LABEL[status]}
        </span>
      </div>
    </div>
  );
}

function groupByCategory(items: Item[]) {
  const groups: Record<string, Item[]> = {};
  for (const item of items) {
    const key = item.category;
    (groups[key] ||= []).push(item);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) =>
      (CATEGORY_LABEL[a as ItemCategory] || a).localeCompare(
        CATEGORY_LABEL[b as ItemCategory] || b
      )
    )
  );
}
