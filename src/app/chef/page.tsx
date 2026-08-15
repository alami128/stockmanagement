import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StockStepper from "@/components/StockStepper";
import AddItemForm from "@/components/AddItemForm";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default async function ChefPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = (data || []) as Item[];

  // Sort the items that need attention to the top so a busy chef sees
  // what's running low first, without hiding anything else.
  const sorted = [...items].sort((a, b) => {
    const order = { needs_order: 0, low: 1, available: 2 } as const;
    return order[getStockStatus(a)] - order[getStockStatus(b)];
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <DashboardHeader
        title="Kitchen Items"
        subtitle="Adjust how much of each item you have on hand"
      />

      <div className="space-y-3">
        {sorted.map((item) => (
          <StockStepper key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-gray-500 shadow-sm">
            No items yet. Add your first item below.
          </p>
        )}
      </div>

      <div className="mt-6">
        <AddItemForm />
      </div>
    </main>
  );
}
