import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import StatusBadge from "@/components/StatusBadge";
import OrderStatusActions from "@/components/OrderStatusActions";

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
    .select("*, items:item_id(name)")
    .eq("order_id", params.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <DashboardHeader
        title={(order as any).order_number}
        subtitle={`Created ${new Date(order.created_at).toLocaleString()} by ${
          (order as any).users?.name || "Unknown"
        }`}
      />

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
        <span className="font-medium text-gray-600">Status</span>
        <StatusBadge status={order.status} />
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {lines?.map((line: any) => (
          <div
            key={line.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {line.items?.name}
              </p>
              {line.notes && (
                <p className="text-sm text-gray-500">{line.notes}</p>
              )}
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {line.quantity}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <OrderStatusActions orderId={order.id} status={order.status} />
      </div>
    </main>
  );
}
