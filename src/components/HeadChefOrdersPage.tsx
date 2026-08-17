import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import HeadChefOrdersView from "@/components/HeadChefOrdersView";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default async function HeadChefOrdersPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = ((data || []) as Item[]).filter(
    (i) => i.category !== "cleaning"
  );

  const outOfStock = items.filter(
    (i) => getStockStatus(i) === "needs_order"
  ).length;
  const runningLow = items.filter((i) => getStockStatus(i) === "low").length;
  const alertCount = outOfStock + runningLow;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href="/senior-chef" />

      <DashboardHeader
        eyebrow="Orders"
        title="Order overview"
        subtitle={
          alertCount > 0
            ? `${outOfStock} out of stock · ${runningLow} running low`
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

      <HeadChefOrdersView items={items} />
    </main>
  );
}
