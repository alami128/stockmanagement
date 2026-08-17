import type { KitchenStatusTask, KitchenTaskType } from "@/lib/types";

type TaskRow = KitchenStatusTask & {
  users?: { name: string } | null;
};

const TYPE_LABELS: Record<KitchenTaskType, { pending: string; done: string }> =
  {
    clean: { pending: "To clean", done: "Cleaned" },
    fix: { pending: "To fix", done: "Fixed" },
  };

export default function HeadChefKitchenStatusView({
  tasks,
}: {
  tasks: TaskRow[];
}) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-neutral-500">
        No kitchen status items for today yet. Chefs will add them here.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {(["clean", "fix"] as const).map((taskType) => (
        <TaskTypeView
          key={taskType}
          taskType={taskType}
          tasks={tasks.filter((t) => t.task_type === taskType)}
        />
      ))}
    </div>
  );
}

function TaskTypeView({
  taskType,
  tasks,
}: {
  taskType: KitchenTaskType;
  tasks: TaskRow[];
}) {
  const labels = TYPE_LABELS[taskType];
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const pendingBadge =
    taskType === "clean"
      ? "border-blue-500 text-blue-700"
      : "border-orange-500 text-orange-700";

  return (
    <section className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-neutral-900">
        {taskType === "clean" ? "Cleaning" : "Repairs"}
      </h2>

      <PrepGroup
        title={labels.pending}
        badgeClass={pendingBadge}
        items={pending}
        emptyMessage={
          taskType === "clean"
            ? "Nothing left to clean."
            : "Nothing left to fix."
        }
      />
      <PrepGroup
        title={labels.done}
        badgeClass="border-green-500 text-green-700"
        items={done}
        emptyMessage={
          taskType === "clean"
            ? "Nothing marked cleaned yet."
            : "Nothing marked fixed yet."
        }
        strikethrough
        doneLabel={taskType === "clean" ? "Cleaned" : "Fixed"}
      />
    </section>
  );
}

function PrepGroup({
  title,
  badgeClass,
  items,
  emptyMessage,
  strikethrough = false,
  doneLabel,
}: {
  title: string;
  badgeClass: string;
  items: TaskRow[];
  emptyMessage: string;
  strikethrough?: boolean;
  doneLabel?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3
          className={`inline-flex rounded-full border-2 px-3.5 py-1.5 font-display text-sm font-semibold tracking-tight ${badgeClass}`}
        >
          {title}
        </h3>
        <span className="text-sm text-neutral-400">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-6 text-center text-sm text-neutral-500">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 px-4 py-3.5"
            >
              <div className="min-w-0">
                <p
                  className={`font-medium ${
                    strikethrough
                      ? "text-neutral-500 line-through"
                      : "text-neutral-900"
                  }`}
                >
                  {row.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {row.users?.name || "Chef"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border-2 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badgeClass}`}
              >
                {strikethrough ? doneLabel || "Done" : title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
