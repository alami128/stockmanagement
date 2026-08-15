const STYLES: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  ordered: "bg-neutral-100 text-neutral-700",
  completed: "bg-neutral-900 text-white",
};

const LABELS: Record<string, string> = {
  draft: "Draft",
  ordered: "Ordered",
  completed: "Completed",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        STYLES[status] || "bg-neutral-100 text-neutral-600"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
