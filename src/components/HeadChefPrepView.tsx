import type { PrepSelection } from "@/lib/types";
import {
  HeadChefCategoryBlock,
  HeadChefEmptyState,
  HeadChefItemCard,
  HeadChefProgressBar,
  HeadChefSectionGroup,
  HeadChefSubsection,
  HeadChefSummaryGrid,
} from "@/components/HeadChefOverviewUI";

type SelectionRow = PrepSelection & {
  users?: { name: string } | null;
};

export default function HeadChefPrepView({
  selections,
}: {
  selections: SelectionRow[];
}) {
  if (selections.length === 0) {
    return (
      <HeadChefEmptyState
        icon="🍳"
        title="No preps yet today"
        message="When chefs add menu or custom preps, they’ll show up here so you can track what’s left and what’s done."
      />
    );
  }

  const pending = selections.filter((s) => !s.done);
  const done = selections.filter((s) => s.done);
  const total = selections.length;

  const pendingBySection = groupBySection(pending);
  const doneBySection = groupBySection(done);

  return (
    <div className="space-y-6">
      <HeadChefSummaryGrid
        stats={[
          { label: "To prep", value: pending.length, tone: "amber" },
          { label: "Done", value: done.length, tone: "green" },
          { label: "Total", value: total, tone: "neutral" },
          {
            label: "Chefs",
            value: countChefs(selections),
            tone: "neutral",
          },
        ]}
      />

      <HeadChefProgressBar done={done.length} total={total} />

      <HeadChefCategoryBlock
        icon="📋"
        title="Today’s prep list"
        description="Grouped by menu section. Chefs tick items off when finished."
        accentClass="border-l-4 border-l-amber-400"
      >
        <HeadChefSubsection
          title="Still to prep"
          count={pending.length}
          tone="amber"
          emptyMessage="All preps are done — great work from the team."
        >
          {pending.length > 0 &&
            Object.entries(pendingBySection).map(([section, items]) => (
              <HeadChefSectionGroup
                key={section}
                sectionName={section}
                count={items.length}
              >
                {items.map((row) => (
                  <HeadChefItemCard
                    key={row.id}
                    title={row.name}
                    chefName={row.users?.name || "Chef"}
                    statusLabel="To prep"
                    tone="amber"
                  />
                ))}
              </HeadChefSectionGroup>
            ))}
        </HeadChefSubsection>

        <HeadChefSubsection
          title="Completed"
          count={done.length}
          tone="green"
          emptyMessage="Nothing marked done yet."
        >
          {done.length > 0 &&
            Object.entries(doneBySection).map(([section, items]) => (
              <HeadChefSectionGroup
                key={section}
                sectionName={section}
                count={items.length}
              >
                {items.map((row) => (
                  <HeadChefItemCard
                    key={row.id}
                    title={row.name}
                    chefName={row.users?.name || "Chef"}
                    statusLabel="Done"
                    tone="green"
                    done
                  />
                ))}
              </HeadChefSectionGroup>
            ))}
        </HeadChefSubsection>
      </HeadChefCategoryBlock>
    </div>
  );
}

function groupBySection(items: SelectionRow[]) {
  const groups: Record<string, SelectionRow[]> = {};
  for (const item of items) {
    const key = item.section?.trim() || "Other";
    (groups[key] ||= []).push(item);
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  );
}

function countChefs(items: SelectionRow[]) {
  return new Set(items.map((i) => i.users?.name || i.selected_by)).size;
}
