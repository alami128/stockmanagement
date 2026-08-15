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
  const attention = items.filter((i) => getStockStatus(i) !== "available").length;
  const out = items.filter((i) => getStockStatus(i) === "needs_order").length;
  const low = items.filter((i) => getStockStatus(i) === "low").length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Senior Chef"
        title="Kitchen Stock"
        subtitle="A live look at what's on hand — order what the line needs."
      />

      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
          <p className="text-xs text-neutral-400">Attention</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
            {attention}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
          <p className="text-xs text-neutral-400">Out</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
            {out}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
          <p className="text-xs text-neutral-400">Low</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-neutral-900">
            {low}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <Link
          href="/senior-chef/create-order"
          className="btn flex w-full items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Order
        </Link>
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
