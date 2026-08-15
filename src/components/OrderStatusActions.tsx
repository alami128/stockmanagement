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
  const color =
    status === "draft"
      ? "bg-ordered hover:bg-blue-700"
      : "bg-completed hover:bg-teal-800";

  return (
    <button
      onClick={() =>
        startTransition(() => markOrderStatus(orderId, next as any))
      }
      disabled={isPending}
      className={`btn w-full text-white disabled:opacity-60 ${color}`}
    >
      {isPending ? "Updating..." : label}
    </button>
  );
}
