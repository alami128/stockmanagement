"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { login, quickLogin, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { error: null };

type PersonaId = "head_chef" | "chef" | "kps" | "admin";

interface Persona {
  id: PersonaId;
  label: string;
  subtitle: string;
  email: string;
  accent: string;
  quickLogin?: boolean;
}

const PERSONAS: Persona[] = [
  {
    id: "head_chef",
    label: "Head Chef",
    subtitle: "Stock overview & orders",
    email: "seniorchef@example.com",
    accent: "border-green-500 hover:bg-green-50",
    quickLogin: true,
  },
  {
    id: "chef",
    label: "Chef",
    subtitle: "Update kitchen stock",
    email: "chef@example.com",
    accent: "border-blue-500 hover:bg-blue-50",
    quickLogin: true,
  },
  {
    id: "kps",
    label: "Kps",
    subtitle: "Update the cleaning products stock",
    email: "",
    accent: "border-red-500 hover:bg-red-50",
  },
  {
    id: "admin",
    label: "Other",
    subtitle: "Manage orders and staff",
    email: "admin@example.com",
    accent: "border-neutral-900 hover:bg-neutral-50",
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
  const [quickError, setQuickError] = useState<string | null>(null);
  const [isQuickPending, startQuickTransition] = useTransition();

  function handlePersonaClick(p: Persona) {
    setQuickError(null);
    if (p.quickLogin) {
      startQuickTransition(async () => {
        const result = await quickLogin(p.id as "chef" | "head_chef");
        if (result.error) setQuickError(result.error);
      });
      return;
    }
    setPersona(p);
  }

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
                onClick={() => handlePersonaClick(p)}
                disabled={isQuickPending}
                className={`rounded-2xl border-2 bg-white px-5 py-4 text-left transition active:scale-[0.99] disabled:opacity-60 ${p.accent}`}
              >
                <span className="block text-lg font-semibold text-neutral-900">
                  {p.label}
                </span>
                <span className="mt-0.5 block text-sm text-neutral-500">
                  {p.subtitle}
                </span>
              </button>
            ))}
            {(quickError || (isQuickPending && !quickError)) && (
              <p className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                {quickError || "Signing in..."}
              </p>
            )}
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
                  autoFocus={!persona.email}
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
                  autoFocus={Boolean(persona.email)}
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
