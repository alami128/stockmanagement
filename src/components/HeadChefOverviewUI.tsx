import type { ReactNode } from "react";

type StatTone = "amber" | "green" | "blue" | "orange" | "red" | "neutral";

const STAT_TONE: Record<
  StatTone,
  { bg: string; text: string; ring: string; value: string }
> = {
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-amber-200",
    value: "text-amber-900",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-800",
    ring: "ring-green-200",
    value: "text-green-900",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    ring: "ring-blue-200",
    value: "text-blue-900",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    ring: "ring-orange-200",
    value: "text-orange-900",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-800",
    ring: "ring-red-200",
    value: "text-red-900",
  },
  neutral: {
    bg: "bg-neutral-50",
    text: "text-neutral-600",
    ring: "ring-neutral-200",
    value: "text-neutral-900",
  },
};

export function HeadChefSummaryGrid({
  stats,
}: {
  stats: { label: string; value: number; tone: StatTone }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const tone = STAT_TONE[stat.tone];
        return (
          <div
            key={stat.label}
            className={`rounded-2xl p-4 ring-1 ring-inset ${tone.bg} ${tone.ring}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wide ${tone.text}`}>
              {stat.label}
            </p>
            <p
              className={`mt-1 font-display text-3xl font-semibold tabular-nums ${tone.value}`}
            >
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function HeadChefProgressBar({
  done,
  total,
  label = "Completed today",
  detailLabel,
  barClassName = "bg-green-500",
}: {
  done: number;
  total: number;
  label?: string;
  detailLabel?: string;
  barClassName?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          <p className="text-xs text-neutral-500">
            {detailLabel ?? `${done} of ${total} finished`}
          </p>
        </div>
        <span className="font-display text-2xl font-semibold tabular-nums text-neutral-900">
          {pct}%
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function HeadChefEmptyState({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-neutral-900">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
        {message}
      </p>
    </div>
  );
}

export function HeadChefCategoryBlock({
  icon,
  title,
  description,
  accentClass,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm ${accentClass}`}
    >
      <div className="border-b border-neutral-100 bg-neutral-50/80 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-neutral-200"
            aria-hidden
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-neutral-900">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function HeadChefSubsection({
  title,
  count,
  tone,
  emptyMessage,
  children,
}: {
  title: string;
  count: number;
  tone: StatTone;
  emptyMessage?: string;
  children: ReactNode;
}) {
  const colors = STAT_TONE[tone];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colors.bg} ${colors.text} ring-1 ring-inset ${colors.ring}`}
        >
          {title}
        </span>
        <span className="text-sm font-medium tabular-nums text-neutral-400">
          {count}
        </span>
      </div>
      {count === 0 && emptyMessage ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-5 text-center text-sm text-neutral-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

export function HeadChefItemCard({
  title,
  subtitle,
  chefName,
  statusLabel,
  tone,
  done = false,
}: {
  title: string;
  subtitle?: string;
  chefName: string;
  statusLabel: string;
  tone: StatTone;
  done?: boolean;
}) {
  const colors = STAT_TONE[tone];
  const initial = chefName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 sm:flex sm:items-center sm:gap-4 ${
        done
          ? "border-neutral-100 bg-neutral-50/80"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            done
              ? "bg-green-100 text-green-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
          aria-hidden
        >
          {done ? "✓" : initial}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-base font-medium leading-snug ${
              done ? "text-neutral-500 line-through" : "text-neutral-900"
            }`}
          >
            {title}
          </p>
          {(subtitle || chefName) && (
            <p className="mt-1 text-sm text-neutral-500">
              {[subtitle, chefName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
      <span
        className={`mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide sm:mt-0 sm:w-auto sm:shrink-0 ${colors.bg} ${colors.text} ring-1 ring-inset ${colors.ring}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}

export function HeadChefSectionGroup({
  sectionName,
  count,
  children,
}: {
  sectionName: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {sectionName}
        </p>
        <span className="text-xs tabular-nums text-neutral-400">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
