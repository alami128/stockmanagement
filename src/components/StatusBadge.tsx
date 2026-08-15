const STYLES: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600 ring-stone-200/80",
  ordered: "bg-sky-50 text-sky-700 ring-sky-100",
  completed: "bg-teal-50 text-teal-800 ring-teal-100",
};

const LABELS: Record<string, string> = {
  draft: "Draft",
  ordered: "Ordered",
  completed: "Completed",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ring-1 ${
        STYLES[status] || "bg-stone-100 text-stone-600 ring-stone-200/80"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
