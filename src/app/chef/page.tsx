import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import CategoryMenu from "@/components/CategoryMenu";
import AddItemForm from "@/components/AddItemForm";
import { groupItemsByCategory, isItemCategory } from "@/lib/categories";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

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
        subtitle="Open a category to update what’s on hand."
      />

      {groups.length > 0 ? (
        <CategoryMenu groups={groups} />
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-neutral-500">
          No items yet. Add your first item below.
        </p>
      )}

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
          Add item
        </h2>
        <AddItemForm />
      </div>
    </main>
  );
}
