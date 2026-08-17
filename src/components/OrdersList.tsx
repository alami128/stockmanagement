import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  users?: { name: string } | null;
}

export default function OrdersList({
  orders,
  basePath,
}: {
  orders: OrderRow[];
  basePath: "/chef" | "/senior-chef";
}) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No orders yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`${basePath}/orders/${order.id}`}
          className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-neutral-50"
        >
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">{order.order_number}</p>
            <p className="truncate text-sm text-neutral-500">
              {new Date(order.created_at).toLocaleDateString()} &middot;{" "}
              {order.users?.name || "Unknown"}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </Link>
      ))}
    </div>
  );
}
