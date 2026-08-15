"use client";

import { useTransition } from "react";
import { updateUserRole, removeUser } from "@/lib/actions/users";
import type { AppUser, Role } from "@/lib/types";

const ROLES: Role[] = ["chef", "senior_chef", "admin"];

export default function ManageUsersList({ users }: { users: AppUser[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900">{u.name}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={u.role}
              disabled={isPending}
              onChange={(e) =>
                startTransition(() =>
                  updateUserRole(u.id, e.target.value as Role)
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={() => startTransition(() => removeUser(u.id))}
              disabled={isPending}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      {users.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-4 text-neutral-500">
          No users yet.
        </p>
      )}
    </div>
  );
}
