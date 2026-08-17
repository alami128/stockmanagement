import Link from "next/link";

export default function KitchenNavCard({
  href,
  title,
  subtitle,
  count,
  countLabel,
  accent,
}: {
  href: string;
  title: string;
  subtitle: string;
  count: number;
  countLabel: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-2xl border-2 bg-white p-5 transition active:scale-[0.99] sm:p-6 ${accent}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-neutral-900 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 sm:text-base">{subtitle}</p>
        </div>
        <span className="shrink-0 text-2xl text-neutral-300 transition group-hover:text-neutral-400">
          →
        </span>
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold tabular-nums text-neutral-900">
          {count}
        </span>
        <span className="text-sm text-neutral-500">{countLabel}</span>
      </div>
    </Link>
  );
}
