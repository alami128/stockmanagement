import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import AddItemForm from "@/components/AddItemForm";
import ManageItemsList from "@/components/ManageItemsList";
import ManageUsersList from "@/components/ManageUsersList";
import CreateUserForm from "@/components/CreateUserForm";

export default async function AdminPage() {
  const supabase = createClient();

  const [{ data: items }, { data: users }] = await Promise.all([
    supabase.from("items").select("*").order("name"),
    supabase.from("users").select("*").order("name"),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <DashboardHeader
        title="Admin"
        subtitle="Manage kitchen items and user accounts"
      />

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Items</h2>
        <div className="mb-3">
          <AddItemForm />
        </div>
        <ManageItemsList items={items || []} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">Users</h2>
        <div className="mb-3">
          <CreateUserForm />
        </div>
        <ManageUsersList users={users || []} />
      </section>
    </main>
  );
}
