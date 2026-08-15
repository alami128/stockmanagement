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
      ? "bg-gradient-to-r from-sky-600 to-blue-600 hover:brightness-105"
      : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-105";

  return (
    <button
      onClick={() =>
        startTransition(() => markOrderStatus(orderId, next as any))
      }
      disabled={isPending}
      className={`btn w-full text-white shadow-[0_16px_36px_-20px_rgba(15,23,42,0.45)] disabled:opacity-60 ${color}`}
    >
      {isPending ? "Updating..." : label}
    </button>
  );
}
