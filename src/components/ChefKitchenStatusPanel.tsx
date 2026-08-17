"use client";

import { useState, useTransition } from "react";
import {
  addKitchenTask,
  removeKitchenTask,
  toggleKitchenEquipmentTask,
  toggleKitchenTaskDone,
} from "@/lib/actions/kitchen-status";
import type {
  KitchenEquipment,
  KitchenStatusTask,
  KitchenTaskType,
} from "@/lib/types";

type TaskRow = KitchenStatusTask & {
  users?: { name: string } | null;
};

const TASK_LABELS: Record<KitchenTaskType, { add: string; today: string }> = {
  clean: {
    add: "Add something to clean",
    today: "To clean",
  },
  fix: {
    add: "Add something to fix",
    today: "To fix",
  },
};

export default function ChefKitchenStatusPanel({
  equipment,
  tasks,
  areas,
}: {
  equipment: KitchenEquipment[];
  tasks: TaskRow[];
  areas: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [customClean, setCustomClean] = useState("");
  const [customFix, setCustomFix] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedEquipment = (type: KitchenTaskType) =>
    new Set(
      tasks
        .filter((t) => t.task_type === type && t.equipment_id)
        .map((t) => t.equipment_id as string)
    );

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else {
        setCustomClean("");
        setCustomFix("");
      }
    });
  }

  return (
    <div className={`space-y-10 ${isPending ? "opacity-70" : ""}`}>
      {(["clean", "fix"] as const).map((taskType) => (
        <TaskTypeSection
          key={taskType}
          taskType={taskType}
          customValue={taskType === "clean" ? customClean : customFix}
          onCustomChange={taskType === "clean" ? setCustomClean : setCustomFix}
          equipment={equipment}
          areas={areas}
          tasks={tasks.filter((t) => t.task_type === taskType)}
          selectedIds={selectedEquipment(taskType)}
          isPending={isPending}
          onAddCustom={(name) => run(() => addKitchenTask(taskType, name))}
          onToggleEquipment={(id, selected) =>
            run(() => toggleKitchenEquipmentTask(id, taskType, selected))
          }
          onToggleDone={(id, done) => run(() => toggleKitchenTaskDone(id, done))}
          onRemove={(id) => run(() => removeKitchenTask(id))}
        />
      ))}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function TaskTypeSection({
  taskType,
  customValue,
  onCustomChange,
  equipment,
  areas,
  tasks,
  selectedIds,
  isPending,
  onAddCustom,
  onToggleEquipment,
  onToggleDone,
  onRemove,
}: {
  taskType: KitchenTaskType;
  customValue: string;
  onCustomChange: (value: string) => void;
  equipment: KitchenEquipment[];
  areas: string[];
  tasks: TaskRow[];
  selectedIds: Set<string>;
  isPending: boolean;
  onAddCustom: (name: string) => void;
  onToggleEquipment: (id: string, selected: boolean) => void;
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const labels = TASK_LABELS[taskType];
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const accent =
    taskType === "clean"
      ? "border-blue-500 text-blue-700"
      : "border-orange-500 text-orange-700";

  return (
    <section className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-neutral-900">
        {labels.today}
      </h2>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAddCustom(customValue);
        }}
      >
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={
            taskType === "clean"
              ? "e.g. Deep clean walk-in shelves"
              : "e.g. Fryer thermostat not working"
          }
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-neutral-400"
        />
        <button
          type="submit"
          disabled={isPending || !customValue.trim()}
          className="shrink-0 rounded-xl border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {equipment.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-500">
            Kitchen equipment
          </h3>
          <div className="space-y-4">
            {areas.map((area) => {
              const areaItems = equipment.filter((item) => item.area === area);
              if (areaItems.length === 0) return null;

              return (
                <div key={area}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {area}
                  </h4>
                  <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {areaItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <li key={item.id}>
                          <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5 hover:bg-neutral-50">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isPending}
                              onChange={(e) =>
                                onToggleEquipment(item.id, e.target.checked)
                              }
                              className="h-5 w-5 shrink-0 accent-neutral-900"
                            />
                            <span className="flex-1 text-base font-medium text-neutral-900">
                              {item.name}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-6 text-center text-sm text-neutral-500">
          Nothing flagged yet. Add above or pick equipment.
        </p>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <TaskList
              title={labels.today}
              badgeClass={accent}
              items={pending}
              isPending={isPending}
              onToggleDone={onToggleDone}
              onRemove={onRemove}
            />
          )}
          {done.length > 0 && (
            <TaskList
              title="Done"
              badgeClass="border-green-500 text-green-700"
              items={done}
              isPending={isPending}
              done
              onToggleDone={onToggleDone}
              onRemove={onRemove}
            />
          )}
        </div>
      )}
    </section>
  );
}

function TaskList({
  title,
  badgeClass,
  items,
  isPending,
  done = false,
  onToggleDone,
  onRemove,
}: {
  title: string;
  badgeClass: string;
  items: TaskRow[];
  isPending: boolean;
  done?: boolean;
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <h3
        className={`mb-2 inline-flex rounded-full border-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
      >
        {title}
      </h3>
      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {items.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-4 py-3.5">
            <input
              type="checkbox"
              checked={row.done}
              disabled={isPending}
              onChange={(e) => onToggleDone(row.id, e.target.checked)}
              className="h-5 w-5 shrink-0 accent-neutral-900"
              aria-label={`Mark ${row.name} done`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`font-medium ${
                  row.done ? "text-neutral-400 line-through" : "text-neutral-900"
                }`}
              >
                {row.name}
              </p>
            </div>
            {!row.done && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onRemove(row.id)}
                className="shrink-0 text-xs font-medium text-neutral-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
