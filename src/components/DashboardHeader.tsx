import { logout } from "@/lib/actions/auth";

export default function DashboardHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600/90">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-md text-base leading-relaxed text-stone-500">
            {subtitle}
          </p>
        )}
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="shrink-0 rounded-xl border border-stone-200/80 bg-white/80 px-4 py-2.5 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur transition hover:border-stone-300 hover:bg-white hover:text-stone-900"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
