"use client";

import { CATEGORY_LABEL, groupItemsByCategory, isItemCategory } from "@/lib/categories";
import { formatQuantity } from "@/lib/stock";
import type { Item } from "@/lib/types";

function buildOutOfStockText(items: Item[], date: string): string {
  const normalized = items.map((item) => ({
    ...item,
    category: isItemCategory(item.category) ? item.category : "other",
  }));

  const groups = groupItemsByCategory(normalized);

  const lines: string[] = [
    "OUT OF STOCK",
    `Date: ${date}`,
    `Items: ${items.length}`,
    "",
  ];

  if (items.length === 0) {
    lines.push("Nothing is out of stock right now.");
    return lines.join("\n") + "\n";
  }

  for (const { category, items: groupItems } of groups) {
    lines.push(CATEGORY_LABEL[category].toUpperCase());
    lines.push("-".repeat(CATEGORY_LABEL[category].length));
    for (const item of groupItems) {
      lines.push(
        `- ${item.name} (${formatQuantity(item.quantity, item.unit)})`
      );
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

export default function DownloadOutOfStockButton({
  items,
  date,
}: {
  items: Item[];
  date: string;
}) {
  function handleDownload() {
    const text = buildOutOfStockText(items, date);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `out-of-stock-${date}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={items.length === 0}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-5 py-3.5 text-base font-semibold text-neutral-900 transition hover:bg-neutral-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-white"
    >
      {items.length === 0
        ? "No out of stock items to download"
        : `Download out of stock list (${items.length})`}
      {items.length > 0 && <span aria-hidden>↓</span>}
    </button>
  );
}
