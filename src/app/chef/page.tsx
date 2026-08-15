import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StockStepper from "@/components/StockStepper";
import AddItemForm from "@/components/AddItemForm";
import {
  CATEGORY_LABEL,
  groupItemsByCategory,
  isItemCategory,
} from "@/lib/categories";
import { getStockStatus } from "@/lib/stock";
import type { Item, ItemCategory } from "@/lib/types";

function withCategory(item: Item): Item {
  return {
    ...item,
    category: isItemCategory(item.category) ? item.category : "other",
  };
}

export default async function ChefPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = ((data || []) as Item[]).map(withCategory);

  const groups = groupItemsByCategory(items).map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => {
      const order = { needs_order: 0, low: 1, available: 2 } as const;
      return order[getStockStatus(a)] - order[getStockStatus(b)];
    }),
  }));

  return (
    <main className="mx-auto min-h-full max-w-2xl px-4 py-8">
      <DashboardHeader
        eyebrow="Chef"
        title="Kitchen Items"
        subtitle="Stock grouped by category — adjust what’s on hand as you cook."
      />

      <div className="space-y-8">
        {groups.map(({ category, items: sectionItems }) => (
          <CategorySection
            key={category}
            category={category}
            items={sectionItems}
          />
        ))}

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-neutral-500">
            No items yet. Add your first item below.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
          Add item
        </h2>
        <AddItemForm />
      </div>
    </main>
  );
}

function CategorySection({
  category,
  items,
}: {
  category: ItemCategory;
  items: Item[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          {CATEGORY_LABEL[category]}
        </h2>
        <span className="text-sm text-neutral-400">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <StockStepper key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
