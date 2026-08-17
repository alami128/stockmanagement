import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import StockOverview from "@/components/StockOverview";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default async function HeadChefOrdersPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = ((data || []) as Item[]).filter(
    (i) => i.category !== "cleaning"
  );

  const alertCount = items.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href="/senior-chef" />

      <DashboardHeader
        eyebrow="Orders"
        title="Items to Order"
        subtitle={
          alertCount > 0
            ? `${alertCount} item${alertCount === 1 ? "" : "s"} out or running low`
            : "Chefs haven’t flagged any stock issues yet"
        }
      />

      <div className="mb-6">
        <Link
          href="/senior-chef/create-order"
          className="btn inline-flex w-full items-center justify-center bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Create order
        </Link>
      </div>

      <StockOverview
        items={items}
        sections={["needs_order", "low"]}
      />
    </main>
  );
}
