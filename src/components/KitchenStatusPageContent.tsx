import DashboardHeader from "@/components/DashboardHeader";
import DashboardBackLink from "@/components/DashboardBackLink";
import ChefKitchenStatusPanel from "@/components/ChefKitchenStatusPanel";
import HeadChefKitchenStatusView from "@/components/HeadChefKitchenStatusView";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { KitchenEquipment, KitchenStatusTask } from "@/lib/types";

type TaskRow = KitchenStatusTask & {
  users?: { name: string } | null;
};

export default function KitchenStatusPageContent({
  basePath,
  mode,
  equipment,
  areas,
  tasks,
  pendingCount,
  doneCount,
}: {
  basePath: KitchenBasePath;
  mode: "select" | "view";
  equipment: KitchenEquipment[];
  areas: string[];
  tasks: TaskRow[];
  pendingCount: number;
  doneCount: number;
}) {
  const pendingClean = tasks.filter((t) => t.task_type === "clean" && !t.done)
    .length;
  const pendingFix = tasks.filter((t) => t.task_type === "fix" && !t.done)
    .length;

  const subtitle =
    pendingCount > 0
      ? `${pendingClean} to clean · ${pendingFix} to fix${doneCount > 0 ? ` · ${doneCount} done` : ""}`
      : doneCount > 0
        ? `${doneCount} item${doneCount === 1 ? "" : "s"} done today`
        : "Flag equipment to clean or fix.";

  return (
    <main className="mx-auto min-h-full max-w-3xl px-4 py-8 sm:px-6">
      <DashboardBackLink href={basePath} />

      <DashboardHeader
        eyebrow="Kitchen Status"
        title={mode === "select" ? "Today’s Status" : "Kitchen overview"}
        subtitle={
          mode === "select"
            ? subtitle
            : pendingCount > 0
              ? `${pendingClean} cleaning · ${pendingFix} repairs still open`
              : doneCount > 0
                ? `All ${doneCount} task${doneCount === 1 ? "" : "s"} completed today`
                : "Waiting for the team to log equipment status"
        }
      />

      {mode === "select" ? (
        <ChefKitchenStatusPanel
          equipment={equipment}
          tasks={tasks}
          areas={areas}
        />
      ) : (
        <HeadChefKitchenStatusView tasks={tasks} />
      )}
    </main>
  );
}
