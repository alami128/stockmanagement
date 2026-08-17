import Link from "next/link";

export default function DashboardBackLink({
  href,
  label = "Back to dashboard",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="mb-5">
      <Link
        href={href}
        className="text-sm font-medium text-neutral-500 hover:text-neutral-800"
      >
        &larr; {label}
      </Link>
    </div>
  );
}
