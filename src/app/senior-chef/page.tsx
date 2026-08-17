import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import HeadChefNavCard from "@/components/HeadChefNavCard";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default async function SeniorChefPage() {
  const supabase = createClient();

  const [{ data: itemData }, { data: orders }] = await Promise.all([
    supabase.from("items").select("*").order("name"),
    supabase
      .from("orders")
      .select("id, status")
      .in("status", ["draft", "ordered"]),
  ]);

  const items = (itemData || []) as Item[];
  const cleaningItems = items.filter((i) => i.category === "cleaning");
  const kitchenAttention = cleaningItems.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;
  const prepCount = items.filter(
    (i) => i.category !== "cleaning" && getStockStatus(i) !== "available"
  ).length;
  const openOrders = orders?.length ?? 0;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Head Chef"
        title="Kitchen Dashboard"
        subtitle="Choose a section to view details."
      />

      <div className="grid grid-cols-1 gap-4">
        <HeadChefNavCard
          href="/senior-chef/kitchen-status"
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
        <HeadChefNavCard
          href="/senior-chef/preps"
          title="Kitchen Preps"
          subtitle="Food prep items to restock before service"
          count={prepCount}
          countLabel={prepCount === 1 ? "prep needed" : "preps needed"}
          accent="border-yellow-500 hover:bg-yellow-50"
        />
        <HeadChefNavCard
          href="/senior-chef/orders"
          title="Orders"
          subtitle="Supplier orders and deliveries"
          count={openOrders}
          countLabel={openOrders === 1 ? "open order" : "open orders"}
          accent="border-green-500 hover:bg-green-50"
        />
      </div>
    </main>
  );
}
