"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createUser } from "@/lib/actions/users";

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create user"}
    </button>
  );
}

export default function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setError(null);
        try {
          await createUser(formData);
          formRef.current?.reset();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not create user");
        }
      }}
      className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2"
    >
      <input
        name="name"
        placeholder="Full name"
        required
        className="rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <input
        name="password"
        type="password"
        placeholder="Temporary password"
        required
        minLength={6}
        className="rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <select
        name="role"
        defaultValue="chef"
        className="rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="chef">Chef</option>
        <option value="senior_chef">Senior Chef</option>
        <option value="admin">Admin</option>
      </select>
      {error && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <CreateButton />
      </div>
    </form>
  );
}
