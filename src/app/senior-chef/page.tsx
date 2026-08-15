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
    <main className="kitchen-shell relative mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden">
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-8 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute inset-x-12 top-24 h-px bg-gradient-to-r from-transparent via-stone-300/70 to-transparent" />
      </div>

      <DashboardHeader
        eyebrow="Senior Chef"
        title="Kitchen Stock"
        subtitle="A live look at what's on hand — order what the line needs."
      />

      <div className="mb-8 grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="stat-chip rounded-2xl border border-white/70 bg-white/75 p-3.5 shadow-sm backdrop-blur sm:p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">
            Attention
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">
            {attention}
          </p>
        </div>
        <div className="stat-chip rounded-2xl border border-rose-100/80 bg-rose-50/70 p-3.5 shadow-sm backdrop-blur sm:p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-400">
            Out
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-rose-700 sm:text-3xl">
            {out}
          </p>
        </div>
        <div className="stat-chip rounded-2xl border border-amber-100/80 bg-amber-50/70 p-3.5 shadow-sm backdrop-blur sm:p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-500">
            Low
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-amber-700 sm:text-3xl">
            {low}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <Link
          href="/senior-chef/create-order"
          className="btn group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-rose-500 text-white shadow-[0_18px_40px_-18px_rgba(234,88,12,0.85)] hover:brightness-105"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 transition group-hover:rotate-90"
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

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold tracking-tight text-stone-900">
            Previous Orders
          </h2>
          <span className="text-sm text-stone-400">Latest 10</span>
        </div>
        <div className="space-y-2.5">
          {orders?.map((order: any) => (
            <Link
              key={order.id}
              href={`/senior-chef/orders/${order.id}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_1px_0_rgba(28,25,23,0.04)] backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_14px_30px_-20px_rgba(28,25,23,0.4)]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 transition group-hover:text-orange-700">
                  {order.order_number}
                </p>
                <p className="truncate text-sm text-stone-500">
                  {new Date(order.created_at).toLocaleDateString()} &middot;{" "}
                  {order.users?.name || "Unknown"}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </Link>
          ))}
          {(!orders || orders.length === 0) && (
            <p className="rounded-2xl border border-dashed border-stone-300/80 bg-white/60 p-5 text-stone-500">
              No orders yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
