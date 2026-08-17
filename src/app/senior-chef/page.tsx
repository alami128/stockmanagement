import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StockOverview from "@/components/StockOverview";
import PrepsNeededList from "@/components/PrepsNeededList";
import HeadChefOrdersList from "@/components/HeadChefOrdersList";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default async function SeniorChefPage() {
  const supabase = createClient();

  const [{ data: itemData }, { data: orders }] = await Promise.all([
    supabase.from("items").select("*").order("name"),
    supabase
      .from("orders")
      .select("*, users:created_by(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const items = (itemData || []) as Item[];
  const available = items.filter((i) => getStockStatus(i) === "available").length;
  const out = items.filter((i) => getStockStatus(i) === "needs_order").length;
  const low = items.filter((i) => getStockStatus(i) === "low").length;
  const prepCount = out + low;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Head Chef"
        title="Kitchen Dashboard"
        subtitle="Orders, prep priorities, and live stock."
      />

      <div className="space-y-10">
        <section>
          <SectionHeading
            title="Orders"
            subtitle="Supplier orders and delivery tracking"
            action={
              <Link
                href="/senior-chef/create-order"
                className="shrink-0 rounded-lg border border-neutral-900 bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Create order
              </Link>
            }
          />
          <HeadChefOrdersList orders={(orders as any[]) || []} />
        </section>

        <section>
          <SectionHeading
            title="Preps needed"
            subtitle={
              prepCount > 0
                ? `${prepCount} item${prepCount === 1 ? "" : "s"} out or running low`
                : "Items to restock or prep before service"
            }
          />
          <PrepsNeededList items={items} />
        </section>

        <section>
          <SectionHeading
            title="Kitchen status"
            subtitle="Full stock levels across the kitchen"
          />
          <div className="mb-6 grid grid-cols-3 gap-2">
            <div className="rounded-xl border-2 border-red-500 bg-white p-3.5">
              <p className="text-xs font-medium text-red-600">Out of Stock</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
                {out}
              </p>
            </div>
            <div className="rounded-xl border-2 border-yellow-500 bg-white p-3.5">
              <p className="text-xs font-medium text-yellow-700">Running Low</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
                {low}
              </p>
            </div>
            <div className="rounded-xl border-2 border-green-500 bg-white p-3.5">
              <p className="text-xs font-medium text-green-600">Available</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
                {available}
              </p>
            </div>
          </div>
          <StockOverview items={items} />
        </section>
      </div>
    </main>
  );
}
