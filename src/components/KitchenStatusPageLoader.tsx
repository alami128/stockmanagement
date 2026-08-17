import { createClient } from "@/lib/supabase/server";
import KitchenStatusPageContent from "@/components/KitchenStatusPageContent";
import { kitchenToday } from "@/lib/dates";
import type { KitchenBasePath } from "@/components/KitchenDashboardHub";
import type { KitchenEquipment, KitchenStatusTask } from "@/lib/types";

export default async function KitchenStatusPageLoader({
  basePath,
  mode,
}: {
  basePath: KitchenBasePath;
  mode: "select" | "view";
}) {
  const supabase = createClient();
  const today = kitchenToday();

  const [{ data: equipmentData }, { data: tasksData }] = await Promise.all([
    supabase
      .from("kitchen_equipment")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("kitchen_status_tasks")
      .select("*, users:created_by(name)")
      .eq("task_date", today)
      .order("created_at"),
  ]);

  const equipment = (equipmentData || []) as KitchenEquipment[];
  const areas = [...new Set(equipment.map((item) => item.area))].sort();
  const tasks = (tasksData || []) as (KitchenStatusTask & {
    users?: { name: string } | null;
  })[];
  const pendingCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <KitchenStatusPageContent
      basePath={basePath}
      mode={mode}
      equipment={equipment}
      areas={areas}
      tasks={tasks}
      pendingCount={pendingCount}
      doneCount={doneCount}
    />
  );
}
