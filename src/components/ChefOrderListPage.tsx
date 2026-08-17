import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import OrderSheetList from "@/components/OrderSheetList";
import type { Item } from "@/lib/types";

export default async function ChefOrderListPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = ((data || []) as Item[]).filter(
    (i) => i.category !== "cleaning"
  );

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href="/chef" />

      <DashboardHeader
        eyebrow="Orders"
        title="Kitchen Order List"
        subtitle={`${items.length} items on the order sheet.`}
      />

      <p className="mb-6">
        <Link
          href="/chef/stock"
          className="inline-flex rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Update stock levels
        </Link>
      </p>

      <OrderSheetList items={items} />
    </main>
  );
}
