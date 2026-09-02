"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetAllStockToAvailable } from "@/lib/actions/items";

export default function ResetStockToGreenButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all kitchen stock to green?\n\n" +
        "Each item will be set to ONE above its running-low level.\n" +
        "Example: if running low is 2, stock becomes 3.\n" +
        "Today’s chef order flags will also be cleared.\n\n" +
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
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-600 bg-green-50 px-5 py-3.5 text-base font-semibold text-green-800 transition hover:bg-green-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Resetting…" : "Reset to green"}
    </button>
  );
}
