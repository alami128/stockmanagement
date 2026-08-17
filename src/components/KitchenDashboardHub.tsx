import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import KitchenNavCard from "@/components/KitchenNavCard";
import { kitchenToday } from "@/lib/dates";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export type KitchenBasePath = "/chef" | "/senior-chef";

export default async function KitchenDashboardHub({
  basePath,
  eyebrow,
  stockHref,
}: {
  basePath: KitchenBasePath;
  eyebrow: string;
  stockHref?: string;
}) {
  const supabase = createClient();

  const today = kitchenToday();

  const [{ count: pendingKitchenCount }, { count: pendingPrepCount }, { data: needData }] =
    await Promise.all([
      supabase
        .from("kitchen_status_tasks")
        .select("*", { count: "exact", head: true })
        .eq("task_date", today)
        .eq("done", false),
      supabase
        .from("prep_selections")
        .select("*", { count: "exact", head: true })
        .eq("prep_date", today)
        .eq("done", false),
      supabase.from("order_needs").select("item_id").eq("need_date", today),
    ]);

  const { data: itemData } = await supabase.from("items").select("*").order("name");

  const items = (itemData || []) as Item[];
  const pendingKitchen = pendingKitchenCount ?? 0;
  const pendingPreps = pendingPrepCount ?? 0;
  const flaggedItemIds = new Set(
    (needData || []).map((row) => row.item_id as string)
  );
  const headChefOrderCount = new Set([
    ...items
      .filter(
        (i) => i.category !== "cleaning" && getStockStatus(i) !== "available"
      )
      .map((i) => i.id),
    ...flaggedItemIds,
  ]).size;
  const chefOrderListCount = items.filter(
    (i) => i.category !== "cleaning"
  ).length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow={eyebrow}
        title="Kitchen Dashboard"
        subtitle="Choose a section to view details."
      />

      <div className="grid grid-cols-1 gap-4">
        <KitchenNavCard
          href={`${basePath}/kitchen-status`}
          title="Kitchen Status"
          subtitle={
            basePath === "/chef"
              ? "Flag equipment to clean or fix"
              : "See what needs cleaning or repair"
          }
          count={pendingKitchen}
          countLabel={
            pendingKitchen === 1 ? "item to action" : "items to action"
          }
          accent="border-red-500 hover:bg-red-50"
        />
        <KitchenNavCard
          href={`${basePath}/preps`}
          title="Preps Needed"
          subtitle={
            basePath === "/chef"
              ? "Add preps and mark them done when finished"
              : "See preps to do and what’s already done"
          }
          count={pendingPreps}
          countLabel={
            pendingPreps === 1 ? "prep to do" : "preps to do"
          }
          accent="border-yellow-500 hover:bg-yellow-50"
        />
        <KitchenNavCard
          href={`${basePath}/orders`}
          title="Orders"
          subtitle={
            basePath === "/chef"
              ? "Full kitchen order list and stock levels"
              : "Stock updates and chef flags from the order list"
          }
          count={basePath === "/chef" ? chefOrderListCount : headChefOrderCount}
          countLabel={
            basePath === "/chef"
              ? chefOrderListCount === 1
                ? "item on list"
                : "items on list"
              : headChefOrderCount === 1
                ? "item to order"
                : "items to order"
          }
          accent="border-green-500 hover:bg-green-50"
        />
      </div>

      {stockHref && (
        <p className="mt-6 text-center">
          <Link
            href={stockHref}
            className="text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
          >
            Update kitchen stock levels
          </Link>
        </p>
      )}
    </main>
  );
}
