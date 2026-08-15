import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StatusBadge from "@/components/StatusBadge";
import OrderStatusActions from "@/components/OrderStatusActions";
import ItemIcon from "@/components/ItemIcon";
import { formatQuantity } from "@/lib/stock";
import type { StockUnit } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, users:created_by(name)")
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  const { data: lines } = await supabase
    .from("order_items")
    .select("*, items:item_id(name, unit)")
    .eq("order_id", params.id);

  return (
    <main className="kitchen-shell relative mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 overflow-hidden">
        <div className="absolute -left-10 top-4 h-48 w-48 rounded-full bg-teal-200/35 blur-3xl" />
        <div className="absolute right-4 top-0 h-52 w-52 rounded-full bg-orange-200/35 blur-3xl" />
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
        eyebrow="Order detail"
        title={(order as any).order_number}
        subtitle={`Created ${new Date(order.created_at).toLocaleString()} by ${
          (order as any).users?.name || "Unknown"
        }`}
      />

      <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-400">
          Status
        </span>
        <StatusBadge status={order.status} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-sm backdrop-blur">
        {lines?.map((line: any, index: number) => {
          const unit = (line.items?.unit || "pcs") as StockUnit;
          return (
            <div
              key={line.id}
              className={`flex items-center gap-4 px-4 py-4 sm:px-5 ${
                index > 0 ? "border-t border-stone-100" : ""
              }`}
            >
              <ItemIcon
                name={line.items?.name || "Item"}
                unit={unit}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900">
                  {line.items?.name}
                </p>
                {line.notes ? (
                  <p className="text-sm text-stone-500">{line.notes}</p>
                ) : (
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                    {unit === "pcs"
                      ? "Pieces"
                      : unit === "bottle"
                        ? "Bottles"
                        : unit}
                  </p>
                )}
              </div>
              <span className="text-lg font-bold tabular-nums text-stone-800">
                {formatQuantity(line.quantity, unit)}
              </span>
            </div>
          );
        })}
        {(!lines || lines.length === 0) && (
          <p className="px-5 py-6 text-stone-500">No line items.</p>
        )}
      </div>

      <div className="mt-6">
        <OrderStatusActions orderId={order.id} status={order.status} />
      </div>
    </main>
  );
}
