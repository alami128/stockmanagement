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
          <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-neutral-400">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-md text-base text-neutral-500">
            {subtitle}
          </p>
        )}
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
