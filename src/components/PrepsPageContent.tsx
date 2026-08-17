import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import PrepsNeededList from "@/components/PrepsNeededList";
import { getStockStatus } from "@/lib/stock";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { Item } from "@/lib/types";

export default async function PrepsPageContent({
  basePath,
  stockHref,
}: {
  basePath: KitchenBasePath;
  stockHref?: string;
}) {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = (data || []) as Item[];

  const prepItems = items.filter((i) => i.category !== "cleaning");
  const prepCount = prepItems.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={basePath} />

      <DashboardHeader
        eyebrow="Orders Needed"
        title="Prep Items"
        subtitle={
          prepCount > 0
            ? `${prepCount} food item${prepCount === 1 ? "" : "s"} out or running low`
            : "Food prep stock is above reorder levels"
        }
      />

      {stockHref && prepCount > 0 && (
        <p className="mb-4">
          <Link
            href={stockHref}
            className="inline-flex rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Update stock levels
          </Link>
        </p>
      )}

      <PrepsNeededList items={prepItems} />
    </main>
  );
}
