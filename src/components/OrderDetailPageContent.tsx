import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import StatusBadge from "@/components/StatusBadge";
import OrderStatusActions from "@/components/OrderStatusActions";
import ItemIcon from "@/components/ItemIcon";
import { formatQuantity, unitCaption } from "@/lib/stock";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { StockUnit } from "@/lib/types";

export default async function OrderDetailPageContent({
  orderId,
  basePath,
  canManageStatus = false,
}: {
  orderId: string;
  basePath: KitchenBasePath;
  canManageStatus?: boolean;
}) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, users:created_by(name)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const { data: lines } = await supabase
    .from("order_items")
    .select("*, items:item_id(name, unit)")
    .eq("order_id", orderId);

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={`${basePath}/orders`} label="Back to orders" />

      <DashboardHeader
        eyebrow="Order detail"
        title={(order as any).order_number}
        subtitle={`Created ${new Date(order.created_at).toLocaleString()} by ${
          (order as any).users?.name || "Unknown"
        }`}
      />

      <div className="mb-4 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-4">
        <span className="text-sm text-neutral-500">Status</span>
        <StatusBadge status={order.status} />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {lines?.map((line: any, index: number) => {
          const unit = (line.items?.unit || "pcs") as StockUnit;
          return (
            <div
              key={line.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                index > 0 ? "border-t border-neutral-100" : ""
              }`}
            >
              <ItemIcon
                name={line.items?.name || "Item"}
                unit={unit}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900">
                  {line.items?.name}
                </p>
                {line.notes ? (
                  <p className="text-sm text-neutral-500">{line.notes}</p>
                ) : (
                  <p className="text-xs text-neutral-400">
                    {unitCaption(unit)}
                  </p>
                )}
              </div>
              <span className="text-base font-semibold tabular-nums text-neutral-800">
                {formatQuantity(line.quantity, unit)}
              </span>
            </div>
          );
        })}
        {(!lines || lines.length === 0) && (
          <p className="px-4 py-5 text-neutral-500">No line items.</p>
        )}
      </div>

      {canManageStatus && (
        <div className="mt-6">
          <OrderStatusActions orderId={order.id} status={order.status} />
        </div>
      )}
    </main>
  );
}
