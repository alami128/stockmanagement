import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import CreateOrderForm from "@/components/CreateOrderForm";
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

  // Anything Low Stock or Needs Order belongs on this list. Needs Order
  // items are sorted first since they're the most urgent.
  const attentionItems = items
    .filter((i) => getStockStatus(i) !== "available")
    .sort((a, b) => {
      const order = { needs_order: 0, low: 1, available: 2 } as const;
      return order[getStockStatus(a)] - order[getStockStatus(b)];
    });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <DashboardHeader
        title="What Needs Ordering"
        subtitle="Items running low or out, with what's left in the kitchen"
      />

      <CreateOrderForm items={attentionItems} />

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Previous Orders
        </h2>
        <div className="space-y-2">
          {orders?.map((order: any) => (
            <Link
              key={order.id}
              href={`/senior-chef/orders/${order.id}`}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {order.order_number}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()} &middot;{" "}
                  {order.users?.name || "Unknown"}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </Link>
          ))}
          {(!orders || orders.length === 0) && (
            <p className="rounded-2xl bg-white p-4 text-gray-500 shadow-sm">
              No orders yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
