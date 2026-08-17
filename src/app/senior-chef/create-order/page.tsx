import DashboardBackLink from "@/components/DashboardBackLink";
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
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href="/senior-chef/orders" label="Back to orders" />

      <DashboardHeader
        eyebrow="Ordering"
        title="Create Order"
        subtitle="Pick what the kitchen needs — pcs for counted items, bottles for bottled goods."
      />

      <CreateOrderForm items={attentionItems} />
    </main>
  );
}
