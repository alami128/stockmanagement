import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import SeniorChefBackLink from "@/components/SeniorChefBackLink";
import PrepsNeededList from "@/components/PrepsNeededList";
import { getStockStatus } from "@/lib/stock";
import type { Item } from "@/lib/types";

export default async function PrepsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  const items = (data || []) as Item[];

  const prepItems = items.filter((i) => i.category !== "cleaning");
  const prepCount = prepItems.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <SeniorChefBackLink />

      <DashboardHeader
        eyebrow="Kitchen Preps"
        title="Preps Needed"
        subtitle={
          prepCount > 0
            ? `${prepCount} food item${prepCount === 1 ? "" : "s"} out or running low`
            : "Food prep stock is above reorder levels"
        }
      />

      <PrepsNeededList items={prepItems} />
    </main>
  );
}
