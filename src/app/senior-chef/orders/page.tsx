import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import SeniorChefBackLink from "@/components/SeniorChefBackLink";
import HeadChefOrdersList from "@/components/HeadChefOrdersList";

export default async function OrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, users:created_by(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <SeniorChefBackLink />

      <DashboardHeader
        eyebrow="Orders"
        title="Supplier Orders"
        subtitle="Track drafts, placed orders, and completed deliveries."
      />

      <div className="mb-4">
        <Link
          href="/senior-chef/create-order"
          className="btn inline-flex w-full items-center justify-center bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Create order
        </Link>
      </div>

      <HeadChefOrdersList orders={(orders as any[]) || []} />
    </main>
  );
}
