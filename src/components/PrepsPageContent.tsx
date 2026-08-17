import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import ChefPrepPanel from "@/components/ChefPrepPanel";
import HeadChefPrepView from "@/components/HeadChefPrepView";
import PrepsNeededList from "@/components/PrepsNeededList";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { Item, PrepItem, PrepSelection } from "@/lib/types";

type SelectionRow = PrepSelection & {
  users?: { name: string } | null;
};

export default function PrepsPageContent({
  basePath,
  mode,
  stockHref,
  stockItems,
  orderNeededCount,
  menuItems,
  selections,
  sections,
  pendingPrepCount,
}: {
  basePath: KitchenBasePath;
  mode: "select" | "view";
  stockHref?: string;
  stockItems: Item[];
  orderNeededCount: number;
  menuItems: PrepItem[];
  selections: SelectionRow[];
  sections: string[];
  pendingPrepCount: number;
}) {
  const doneCount = selections.filter((s) => s.done).length;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={basePath} />

      <DashboardHeader
        eyebrow="Preps Needed"
        title={mode === "select" ? "Today’s Preps" : "Team prep overview"}
        subtitle={
          mode === "select"
            ? pendingPrepCount > 0
              ? `${pendingPrepCount} to prep${doneCount > 0 ? ` · ${doneCount} done` : ""}`
              : doneCount > 0
                ? `${doneCount} prep${doneCount === 1 ? "" : "s"} done`
                : "Add preps from the menu or type your own."
            : pendingPrepCount > 0
              ? `${pendingPrepCount} still waiting · ${doneCount} completed`
              : doneCount > 0
                ? `All ${doneCount} prep${doneCount === 1 ? "" : "s"} completed today`
                : "Waiting for the team to add today’s preps"
        }
      />

      {mode === "select" ? (
        <div className="space-y-10">
          {orderNeededCount > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900">
                Items to order
              </h2>
              <p className="mb-4 text-sm text-neutral-500">
                Stock that is out or running low.
              </p>
              <PrepsNeededList items={stockItems} />
            </section>
          )}

          <ChefPrepPanel
            menuItems={menuItems}
            selections={selections}
            sections={sections}
          />

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
        <HeadChefPrepView selections={selections} />
      )}
    </main>
  );
}
