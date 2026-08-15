"use client";

import { useTransition } from "react";
import { markOrderStatus } from "@/lib/actions/orders";

export default function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "completed") {
    return null;
  }

  const next = status === "draft" ? "ordered" : "completed";
  const label = status === "draft" ? "Mark as Ordered" : "Mark as Completed";

  return (
    <button
      onClick={() =>
        startTransition(() => markOrderStatus(orderId, next as any))
      }
      disabled={isPending}
      className="btn w-full bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {isPending ? "Updating..." : label}
    </button>
  );
}
