import { createClient } from "@/lib/supabase/server";
import PrepsPageContent from "@/components/PrepsPageContent";
import { kitchenToday } from "@/lib/dates";
import { getStockStatus } from "@/lib/stock";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { Item, PrepItem } from "@/lib/types";

export default async function PrepsPageLoader({
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
        .select("*, users:selected_by(name)")
        .eq("prep_date", today)
        .order("created_at"),
    ]);

  const stockItems = ((stockData || []) as Item[]).filter(
    (i) => i.category !== "cleaning"
  );
  const orderNeededCount = stockItems.filter(
    (i) => getStockStatus(i) !== "available"
  ).length;
  const menuItems = (prepItems || []) as PrepItem[];
  const sections = [...new Set(menuItems.map((i) => i.section))].sort();
  const selectionRows = (selections as any[]) || [];
  const pendingPrepCount = selectionRows.filter((s) => !s.done).length;

  return (
    <PrepsPageContent
      basePath={basePath}
      mode={mode}
      stockHref={stockHref}
      stockItems={stockItems}
      orderNeededCount={orderNeededCount}
      menuItems={menuItems}
      selections={selectionRows}
      sections={sections}
      pendingPrepCount={pendingPrepCount}
    />
  );
}
