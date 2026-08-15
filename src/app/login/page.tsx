"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { error: null };

type PersonaId = "head_chef" | "chef" | "kps";

interface Persona {
  id: PersonaId;
  label: string;
  subtitle: string;
  email: string;
  accent: string;
}

const PERSONAS: Persona[] = [
  {
    id: "chef",
    label: "Chef",
    subtitle: "Update kitchen stock",
    email: "chef@example.com",
    accent: "border-blue-500 hover:bg-blue-50",
  },
  {
    id: "head_chef",
    label: "Head Chef",
    subtitle: "Stock overview & orders",
    email: "seniorchef@example.com",
    accent: "border-green-500 hover:bg-green-50",
  },
  {
    id: "kps",
    label: "Kps",
    subtitle: "Admin & settings",
    email: "admin@example.com",
    accent: "border-red-500 hover:bg-red-50",
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {pending ? "Signing in..." : "Log in"}
    </button>
  );
}

export default function LoginPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900">
          Kitchen Ordering
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {persona ? `Sign in as ${persona.label}` : "Who’s logging in?"}
        </p>

        {!persona ? (
          <div className="mt-8 grid grid-cols-1 gap-3">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p)}
                className={`rounded-2xl border-2 bg-white px-5 py-4 text-left transition active:scale-[0.99] ${p.accent}`}
              >
                <span className="block text-lg font-semibold text-neutral-900">
                  {p.label}
                </span>
                <span className="mt-0.5 block text-sm text-neutral-500">
                  {p.subtitle}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold text-neutral-900">
                  {persona.label}
                </p>
                <p className="text-sm text-neutral-500">{persona.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setPersona(null)}
                className="shrink-0 text-sm font-medium text-neutral-500 hover:text-neutral-900"
              >
                Change
              </button>
            </div>

            <form action={formAction} className="space-y-4" key={persona.id}>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={persona.email}
                  autoComplete="email"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-lg outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  autoFocus
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-lg outline-none focus:border-neutral-400"
                />
              </div>

              {state.error && (
                <p className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                  {state.error}
                </p>
              )}

              <SubmitButton />
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
