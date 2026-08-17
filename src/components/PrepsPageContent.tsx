import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import ChefPrepPicker from "@/components/ChefPrepPicker";
import HeadChefPrepView from "@/components/HeadChefPrepView";
import { kitchenToday } from "@/lib/dates";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { PrepItem } from "@/lib/types";

export default async function PrepsPageContent({
  basePath,
  mode,
  stockHref,
}: {
  basePath: KitchenBasePath;
  mode: "select" | "view";
  stockHref?: string;
}) {
  const supabase = createClient();
  const today = kitchenToday();

  const [{ data: prepItems }, { data: selections }] = await Promise.all([
    supabase
      .from("prep_items")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("prep_selections")
      .select("*, prep_items(name, section), users:selected_by(name)")
      .eq("prep_date", today)
      .order("created_at"),
  ]);

  const items = (prepItems || []) as PrepItem[];
  const sections = [...new Set(items.map((i) => i.section))].sort();
  const selectedIds = (selections || []).map(
    (s: { prep_item_id: string }) => s.prep_item_id
  );
  const prepCount = selectedIds.length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={basePath} />

      <DashboardHeader
        eyebrow="Preps Needed"
        title={mode === "select" ? "Mark Preps" : "Today’s Preps"}
        subtitle={
          mode === "select"
            ? "Tick the menu items that need to be prepared today."
            : prepCount > 0
              ? `${prepCount} item${prepCount === 1 ? "" : "s"} marked for prep today`
              : "Waiting for chefs to mark today’s preps"
        }
      />

      {mode === "select" ? (
        <>
          <ChefPrepPicker
            items={items}
            selectedIds={selectedIds}
            sections={sections}
          />
          {stockHref && (
            <p className="mt-8 text-center">
              <Link
                href={stockHref}
                className="text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
              >
                Update kitchen stock levels
              </Link>
            </p>
          )}
        </>
      ) : (
        <HeadChefPrepView
          items={items}
          selections={(selections as any[]) || []}
        />
      )}
    </main>
  );
}
