import type { KitchenStatusTask, KitchenTaskType } from "@/lib/types";
import {
  HeadChefCategoryBlock,
  HeadChefEmptyState,
  HeadChefItemCard,
  HeadChefProgressBar,
  HeadChefSubsection,
  HeadChefSummaryGrid,
} from "@/components/HeadChefOverviewUI";

type TaskRow = KitchenStatusTask & {
  users?: { name: string } | null;
};

const CATEGORY: Record<
  KitchenTaskType,
  {
    icon: string;
    title: string;
    description: string;
    accent: string;
    pendingLabel: string;
    doneLabel: string;
    pendingTone: "blue" | "orange";
    pendingEmpty: string;
    doneEmpty: string;
  }
> = {
  clean: {
    icon: "🧽",
    title: "Cleaning",
    description: "Equipment and areas flagged for cleaning today.",
    accent: "border-l-4 border-l-blue-400",
    pendingLabel: "Needs cleaning",
    doneLabel: "Cleaned",
    pendingTone: "blue",
    pendingEmpty: "Nothing left to clean.",
    doneEmpty: "No cleaning tasks marked done yet.",
  },
  fix: {
    icon: "🔧",
    title: "Repairs",
    description: "Equipment issues that need fixing or maintenance.",
    accent: "border-l-4 border-l-orange-400",
    pendingLabel: "Needs repair",
    doneLabel: "Fixed",
    pendingTone: "orange",
    pendingEmpty: "Nothing left to fix.",
    doneEmpty: "No repairs marked done yet.",
  },
};

export default function HeadChefKitchenStatusView({
  tasks,
}: {
  tasks: TaskRow[];
}) {
  if (tasks.length === 0) {
    return (
      <HeadChefEmptyState
        icon="🏠"
        title="Kitchen is all clear"
        message="Chefs haven’t flagged any cleaning or repair items yet. Check back later or ask the team to log equipment status."
      />
    );
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const pendingClean = pending.filter((t) => t.task_type === "clean").length;
  const pendingFix = pending.filter((t) => t.task_type === "fix").length;

  return (
    <div className="space-y-6">
      <HeadChefSummaryGrid
        stats={[
          { label: "To clean", value: pendingClean, tone: "blue" },
          { label: "To fix", value: pendingFix, tone: "orange" },
          { label: "Done", value: done.length, tone: "green" },
          { label: "Total", value: tasks.length, tone: "neutral" },
        ]}
      />

      <HeadChefProgressBar
        done={done.length}
        total={tasks.length}
        label="Kitchen tasks completed"
      />

      {(["clean", "fix"] as const).map((taskType) => {
        const config = CATEGORY[taskType];
        const typeTasks = tasks.filter((t) => t.task_type === taskType);
        if (typeTasks.length === 0) return null;

        const typePending = typeTasks.filter((t) => !t.done);
        const typeDone = typeTasks.filter((t) => t.done);

        return (
          <HeadChefCategoryBlock
            key={taskType}
            icon={config.icon}
            title={config.title}
            description={config.description}
            accentClass={config.accent}
          >
            <HeadChefSubsection
              title={config.pendingLabel}
              count={typePending.length}
              tone={config.pendingTone}
              emptyMessage={config.pendingEmpty}
            >
              {typePending.map((row) => (
                <HeadChefItemCard
                  key={row.id}
                  title={row.name}
                  chefName={row.users?.name || "Chef"}
                  statusLabel={config.pendingLabel}
                  tone={config.pendingTone}
                />
              ))}
            </HeadChefSubsection>

            <HeadChefSubsection
              title={config.doneLabel}
              count={typeDone.length}
              tone="green"
              emptyMessage={config.doneEmpty}
            >
              {typeDone.map((row) => (
                <HeadChefItemCard
                  key={row.id}
                  title={row.name}
                  chefName={row.users?.name || "Chef"}
                  statusLabel={config.doneLabel}
                  tone="green"
                  done
                />
              ))}
            </HeadChefSubsection>
          </HeadChefCategoryBlock>
        );
      })}
    </div>
  );
}
