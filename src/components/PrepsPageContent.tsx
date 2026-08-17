import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import ChefPrepPicker from "@/components/ChefPrepPicker";
import HeadChefPrepView from "@/components/HeadChefPrepView";
import PrepsNeededList from "@/components/PrepsNeededList";
import { kitchenToday } from "@/lib/dates";
import { getStockStatus } from "@/lib/stock";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { Item, PrepItem } from "@/lib/types";

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

  const [{ data: stockData }, { data: prepItems }, { data: selections }] =
    await Promise.all([
      supabase.from("items").select("*").order("name"),
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

  const stockItems = ((stockData || []) as Item[]).filter(
    (i) => i.category !== "cleaning"
  );
  const orderNeededCount = stockItems.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;
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
            ? orderNeededCount > 0
              ? `${orderNeededCount} item${orderNeededCount === 1 ? "" : "s"} need ordering · tick menu preps below`
              : "Tick the menu items that need to be prepared today."
            : prepCount > 0
              ? `${prepCount} item${prepCount === 1 ? "" : "s"} marked for prep today`
              : "Waiting for chefs to mark today’s preps"
        }
      />

      {mode === "select" ? (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
              Items to order
            </h2>
            <p className="mb-4 text-sm text-neutral-500">
              Stock that is out or running low and needs to be reordered.
            </p>
            <PrepsNeededList items={stockItems} />
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
              Menu preps
            </h2>
            <p className="mb-4 text-sm text-neutral-500">
              Choose what to prepare for today&apos;s service.
            </p>
            <ChefPrepPicker
              items={items}
              selectedIds={selectedIds}
              sections={sections}
            />
          </section>

          {stockHref && (
            <p className="text-center">
              <Link
                href={stockHref}
                className="text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
              >
                Update kitchen stock levels
              </Link>
            </p>
          )}
        </div>
      ) : (
        <HeadChefPrepView
          items={items}
          selections={(selections as any[]) || []}
        />
      )}
    </main>
  );
}
