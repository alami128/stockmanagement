"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetAllStockToAvailable } from "@/lib/actions/items";

export default function ResetStockToGreenButton({
  alertCount,
}: {
  alertCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all kitchen stock to green?\n\n" +
        "This will set every item back to available and clear today’s chef order flags.\n\n" +
        "This cannot be undone."
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await resetAllStockToAvailable();
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isPending || alertCount === 0}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-600 bg-green-50 px-5 py-3.5 text-base font-semibold text-green-800 transition hover:bg-green-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-white disabled:text-neutral-400 disabled:hover:bg-white"
    >
      {isPending
        ? "Resetting…"
        : alertCount === 0
          ? "All stock is already green"
          : "Reset to green"}
    </button>
  );
}
