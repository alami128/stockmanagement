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
import type {
  ItemCategory,
  ItemWithUpdater,
  StockStatus,
} from "@/lib/types";

type FlaggedNeed = {
  item: ItemWithUpdater;
  flaggedBy: string;
  flaggedAt: string;
};

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
    description: "Quantity at zero after chef stock updates.",
    accent: "border-l-4 border-l-red-400",
    tone: "red",
    subsectionTitle: "Needs ordering now",
    emptyMessage: "Nothing is completely out of stock.",
  },
  low: {
    icon: "⚠️",
    title: "Running low",
    description: "Below reorder level after chef stock updates.",
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

export default function HeadChefOrdersView({
  items,
  flaggedNeeds,
}: {
  items: ItemWithUpdater[];
  flaggedNeeds: FlaggedNeed[];
}) {
  const grouped: Record<StockStatus, ItemWithUpdater[]> = {
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
  const flaggedOnly = flaggedNeeds.filter(
    (need) => getStockStatus(need.item) === "available"
  );
  const alertCount = outOfStock.length + runningLow.length + flaggedOnly.length;
  const categoryCount = new Set(
    [...outOfStock, ...runningLow, ...flaggedOnly.map((n) => n.item)].map(
      (i) => i.category
    )
  ).size;

  if (items.length === 0) {
    return (
      <HeadChefEmptyState
        icon="📦"
        title="No stock items yet"
        message="Ask an admin to add kitchen items. Chefs update the order list when stock changes."
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
            { label: "Chef flagged", value: 0, tone: "blue" },
            { label: "In stock", value: inStock.length, tone: "green" },
          ]}
        />
        <HeadChefEmptyState
          icon="✅"
          title="Nothing to order right now"
          message="Chefs will flag items here when they update stock or tick “need to order” on the order list."
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
          { label: "Chef flagged", value: flaggedOnly.length, tone: "blue" },
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

      {flaggedOnly.length > 0 && (
        <HeadChefCategoryBlock
          icon="👨‍🍳"
          title="Chef flagged for order"
          description="Items chefs explicitly marked as needed today, even if stock still looks OK."
          accentClass="border-l-4 border-l-blue-400"
        >
          <HeadChefSubsection
            title="Requested by team"
            count={flaggedOnly.length}
            tone="blue"
          >
            {Object.entries(groupFlaggedByCategory(flaggedOnly)).map(
              ([category, needs]) => (
                <HeadChefSectionGroup
                  key={category}
                  sectionName={CATEGORY_LABEL[category as ItemCategory] || category}
                  count={needs.length}
                >
                  {needs.map((need) => (
                    <StockItemCard
                      key={need.item.id}
                      item={need.item}
                      status={getStockStatus(need.item)}
                      tone="blue"
                      meta={`Flagged by ${need.flaggedBy}`}
                      statusLabel="Chef flagged"
                    />
                  ))}
                </HeadChefSectionGroup>
              )
            )}
          </HeadChefSubsection>
        </HeadChefCategoryBlock>
      )}

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
                      meta={updaterMeta(item)}
                      statusLabel={STOCK_STATUS_LABEL[status]}
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

function updaterMeta(item: ItemWithUpdater) {
  const chef = item.users?.name;
  if (!chef) return undefined;
  const when = item.updated_at
    ? new Date(item.updated_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  return when ? `Updated by ${chef} · ${when}` : `Updated by ${chef}`;
}

function StockItemCard({
  item,
  status,
  tone,
  meta,
  statusLabel,
}: {
  item: ItemWithUpdater;
  status: StockStatus;
  tone: "red" | "amber" | "green" | "blue";
  meta?: string;
  statusLabel: string;
}) {
  const colors = {
    red: "bg-red-50 text-red-800 ring-red-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    green: "bg-green-50 text-green-800 ring-green-200",
    blue: "bg-blue-50 text-blue-800 ring-blue-200",
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
            {meta ||
              `${unitCaption(item.unit)} · reorder at ${item.low_stock_threshold}`}
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
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

function groupByCategory(items: ItemWithUpdater[]) {
  const groups: Record<string, ItemWithUpdater[]> = {};
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

function groupFlaggedByCategory(needs: FlaggedNeed[]) {
  const groups: Record<string, FlaggedNeed[]> = {};
  for (const need of needs) {
    const key = need.item.category;
    (groups[key] ||= []).push(need);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.item.name.localeCompare(b.item.name));
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) =>
      (CATEGORY_LABEL[a as ItemCategory] || a).localeCompare(
        CATEGORY_LABEL[b as ItemCategory] || b
      )
    )
  );
}
