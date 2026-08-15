import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import CreateOrderForm from "@/components/CreateOrderForm";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default async function CreateOrderPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = (data || []) as Item[];

  const attentionItems = items
    .filter((i) => getStockStatus(i) !== "available")
    .sort((a, b) => {
      const order = { needs_order: 0, low: 1, available: 2 } as const;
      return order[getStockStatus(a)] - order[getStockStatus(b)];
    });

  return (
    <main className="kitchen-shell relative mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-52 w-52 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      <div className="mb-5">
        <Link
          href="/senior-chef"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 transition hover:text-stone-800"
        >
          <span aria-hidden>&larr;</span> Back to stock overview
        </Link>
      </div>

      <DashboardHeader
        eyebrow="Ordering"
        title="Create Order"
        subtitle="Pick what the kitchen needs — pcs for counted items, bottles for bottled goods."
      />

      <CreateOrderForm items={attentionItems} />
    </main>
  );
}
