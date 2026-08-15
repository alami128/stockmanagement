import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StockStepper from "@/components/StockStepper";
import AddItemForm from "@/components/AddItemForm";
import {
  CATEGORY_ACCENT,
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
    <main className="kitchen-shell relative mx-auto min-h-full max-w-2xl px-4 py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 overflow-hidden">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-0 top-6 h-44 w-44 rounded-full bg-orange-200/35 blur-3xl" />
      </div>

      <DashboardHeader
        eyebrow="Chef"
        title="Kitchen Items"
        subtitle="Stock grouped by category — adjust what’s on hand as you cook."
      />

      <div className="space-y-9">
        {groups.map(({ category, items: sectionItems }) => (
          <CategorySection
            key={category}
            category={category}
            items={sectionItems}
          />
        ))}

        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300/80 bg-white/70 p-5 text-stone-500">
            No items yet. Add your first item below.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-stone-900">
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
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-stone-900">
          <span
            className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${CATEGORY_ACCENT[category]}`}
          />
          {CATEGORY_LABEL[category]}
        </h2>
        <span className="text-sm font-medium text-stone-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <StockStepper key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
