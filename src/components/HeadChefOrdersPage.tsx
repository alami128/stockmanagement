import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import HeadChefOrdersView from "@/components/HeadChefOrdersView";
import { kitchenToday } from "@/lib/dates";
import { getStockStatus } from "@/lib/stock";
import type { Item, ItemWithUpdater } from "@/lib/types";

type FlaggedNeed = {
  item: ItemWithUpdater;
  flaggedBy: string;
  flaggedAt: string;
};

export default async function HeadChefOrdersPage() {
  const supabase = createClient();
  const today = kitchenToday();

  const [{ data: itemData }, { data: needData }] = await Promise.all([
    supabase
      .from("items")
      .select("*, users:updated_by(name)")
      .order("name"),
    supabase
      .from("order_needs")
      .select("*, items(*, users:updated_by(name)), users:flagged_by(name)")
      .eq("need_date", today)
      .order("created_at"),
  ]);

  const items = ((itemData || []) as ItemWithUpdater[]).filter(
    (i) => i.category !== "cleaning"
  );

  const flaggedNeeds: FlaggedNeed[] = (needData || [])
    .map((row) => {
      const item = row.items as ItemWithUpdater | null;
      if (!item || item.category === "cleaning") return null;
      return {
        item,
        flaggedBy: row.users?.name || "Chef",
        flaggedAt: row.created_at as string,
      };
    })
    .filter((row): row is FlaggedNeed => row !== null);

  const outOfStock = items.filter(
    (i) => getStockStatus(i) === "needs_order"
  ).length;
  const runningLow = items.filter((i) => getStockStatus(i) === "low").length;
  const flaggedOnlyCount = flaggedNeeds.filter(
    (need) => getStockStatus(need.item) === "available"
  ).length;
  const alertCount = outOfStock + runningLow + flaggedOnlyCount;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href="/senior-chef" />

      <DashboardHeader
        eyebrow="Orders"
        title="Order overview"
        subtitle={
          alertCount > 0
            ? `${outOfStock} out of stock · ${runningLow} running low${flaggedOnlyCount > 0 ? ` · ${flaggedOnlyCount} chef flagged` : ""}`
            : "All tracked stock is above reorder levels"
        }
      />

      <div className="mb-6">
        <Link
          href="/senior-chef/create-order"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-neutral-900 px-5 py-4 text-base font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
        >
          Create supplier order
          <span aria-hidden>→</span>
        </Link>
      </div>

      <HeadChefOrdersView items={items} flaggedNeeds={flaggedNeeds} />
    </main>
  );
}
