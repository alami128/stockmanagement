import { logout } from "@/lib/actions/auth";

export default function DashboardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
