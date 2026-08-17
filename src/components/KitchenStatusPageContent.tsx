import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import KitchenStatusDetail from "@/components/KitchenStatusDetail";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { Item } from "@/lib/types";

export default async function KitchenStatusPageContent({
  basePath,
}: {
  basePath: KitchenBasePath;
}) {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = (data || []) as Item[];

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={basePath} />

      <DashboardHeader
        eyebrow="Kitchen Status"
        title="Cleaning & Maintenance"
        subtitle="Supplies to restock and areas that need attention."
      />

      <KitchenStatusDetail items={items} />
    </main>
  );
}
