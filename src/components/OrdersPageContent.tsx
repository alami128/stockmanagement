import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import OrdersList from "@/components/OrdersList";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";

export default async function OrdersPageContent({
  basePath,
  canCreateOrder = false,
}: {
  basePath: KitchenBasePath;
  canCreateOrder?: boolean;
}) {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, users:created_by(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={basePath} />

      <DashboardHeader
        eyebrow="Orders"
        title="Supplier Orders"
        subtitle="Track drafts, placed orders, and completed deliveries."
      />

      {canCreateOrder && (
        <div className="mb-4">
          <Link
            href={`${basePath}/create-order`}
            className="btn inline-flex w-full items-center justify-center bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Create order
          </Link>
        </div>
      )}

      <OrdersList orders={(orders as any[]) || []} basePath={basePath} />
    </main>
  );
}
