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

  const [{ data: itemData }, { data: orders }, { count: prepCount }] =
    await Promise.all([
      supabase.from("items").select("*").order("name"),
      supabase
        .from("orders")
        .select("id, status")
        .in("status", ["draft", "ordered"]),
      supabase
        .from("prep_selections")
        .select("*", { count: "exact", head: true })
        .eq("prep_date", today),
    ]);

  const items = (itemData || []) as Item[];
  const cleaningItems = items.filter((i) => i.category === "cleaning");
  const kitchenAttention = cleaningItems.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;
  const prepsMarked = prepCount ?? 0;
  const openOrders = orders?.length ?? 0;

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
          subtitle="Cleaning supplies, repairs, and maintenance needs"
          count={kitchenAttention}
          countLabel={
            kitchenAttention === 1
              ? "item needs attention"
              : "items need attention"
          }
          accent="border-red-500 hover:bg-red-50"
        />
        <KitchenNavCard
          href={`${basePath}/preps`}
          title="Preps Needed"
          subtitle={
            basePath === "/chef"
              ? "Mark menu items to prepare for service"
              : "See what chefs marked for prep today"
          }
          count={prepsMarked}
          countLabel={prepsMarked === 1 ? "prep marked" : "preps marked"}
          accent="border-yellow-500 hover:bg-yellow-50"
        />
        <KitchenNavCard
          href={`${basePath}/orders`}
          title="Orders"
          subtitle="Supplier orders and deliveries"
          count={openOrders}
          countLabel={openOrders === 1 ? "open order" : "open orders"}
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
