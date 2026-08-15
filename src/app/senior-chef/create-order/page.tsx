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

  // Only items that actually need attention are worth ordering.
  const attentionItems = items
    .filter((i) => getStockStatus(i) !== "available")
    .sort((a, b) => {
      const order = { needs_order: 0, low: 1, available: 2 } as const;
      return order[getStockStatus(a)] - order[getStockStatus(b)];
    });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4">
        <Link
          href="/senior-chef"
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          &larr; Back to stock overview
        </Link>
      </div>

      <DashboardHeader
        title="Create Order"
        subtitle="Choose what to order and how much"
      />

      <CreateOrderForm items={attentionItems} />
    </main>
  );
}
