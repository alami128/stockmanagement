import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StockOverview from "@/components/StockOverview";
import StatusBadge from "@/components/StatusBadge";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

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

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Senior Chef"
        title="Kitchen Stock"
        subtitle="A live look at what's on hand."
      />

      <div className="mb-8 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-red-500 bg-white p-3.5">
          <p className="text-xs font-medium text-red-600">Out of Stock</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
            {out}
          </p>
        </div>
        <div className="rounded-xl border border-orange-500 bg-white p-3.5">
          <p className="text-xs font-medium text-orange-600">Running Low</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
            {low}
          </p>
        </div>
        <div className="rounded-xl border border-green-500 bg-white p-3.5">
          <p className="text-xs font-medium text-green-600">Available</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
            {available}
          </p>
        </div>
      </div>

      <StockOverview items={items} />

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Previous Orders
          </h2>
          <span className="text-sm text-neutral-400">Latest 10</span>
        </div>
        <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {orders?.map((order: any) => (
            <Link
              key={order.id}
              href={`/senior-chef/orders/${order.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-neutral-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">
                  {order.order_number}
                </p>
                <p className="truncate text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleDateString()} &middot;{" "}
                  {order.users?.name || "Unknown"}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </Link>
          ))}
          {(!orders || orders.length === 0) && (
            <p className="px-4 py-5 text-neutral-500">No orders yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
