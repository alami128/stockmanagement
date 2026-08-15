const STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  ordered: "bg-blue-100 text-blue-700",
  completed: "bg-teal-100 text-teal-700",
};

const LABELS: Record<string, string> = {
  draft: "Draft",
  ordered: "Ordered",
  completed: "Completed",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        STYLES[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
