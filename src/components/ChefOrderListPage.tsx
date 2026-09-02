import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import CategoryMenu from "@/components/CategoryMenu";
import DownloadOutOfStockButton from "@/components/DownloadOutOfStockButton";
import ResetStockToGreenButton from "@/components/ResetStockToGreenButton";
import { kitchenToday } from "@/lib/dates";
import { groupItemsByCategory, isItemCategory } from "@/lib/categories";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

function withCategory(item: Item): Item {
  return {
    ...item,
    category: isItemCategory(item.category) ? item.category : "other",
  };
}

export default async function ChefOrderListPage() {
  const supabase = createClient();
  const today = kitchenToday();

  const [{ data: itemData }, { data: needData }] = await Promise.all([
    supabase.from("items").select("*").order("name"),
    supabase.from("order_needs").select("item_id").eq("need_date", today),
  ]);

  const items = ((itemData || []) as Item[])
    .filter((i) => i.category !== "cleaning")
    .map(withCategory);

  const flaggedItemIds = new Set(
    (needData || []).map((row) => row.item_id as string)
  );

  const alertCount = items.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;
  const outOfStockItems = items
    .filter((i) => getStockStatus(i) === "needs_order")
    .sort((a, b) => a.name.localeCompare(b.name));
  const flaggedCount = flaggedItemIds.size;

  const groups = groupItemsByCategory(items)
    .filter((g) => g.category !== "cleaning")
    .map((group) => ({
      ...group,
      // Keep A–Z order so items stay put while stock status changes
      items: [...group.items].sort((a, b) => a.name.localeCompare(b.name)),
    }));

  return (
    <main className="mx-auto min-h-full max-w-2xl px-4 py-8 sm:px-6">
      <DashboardBackLink href="/chef" />

      <DashboardHeader
        eyebrow="Orders"
        title="Kitchen Order List"
        subtitle={
          alertCount > 0 || flaggedCount > 0
            ? `${alertCount} low or out · ${flaggedCount} flagged for head chef`
            : "Update quantities or flag items the kitchen needs to order."
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DownloadOutOfStockButton items={outOfStockItems} date={today} />
        <ResetStockToGreenButton alertCount={alertCount + flaggedCount} />
      </div>

      {groups.length > 0 ? (
        <CategoryMenu
          groups={groups}
          flaggedItemIds={flaggedItemIds}
          showOrderNeedToggle
        />
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-center text-neutral-500">
          No items on the order list yet.
        </p>
      )}
    </main>
  );
}
