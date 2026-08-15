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
  ring: string;
}

const PERSONAS: Persona[] = [
  {
    id: "head_chef",
    label: "Head Chef",
    subtitle: "Stock overview & orders",
    email: "seniorchef@example.com",
    ring: "ring-orange-500",
  },
  {
    id: "chef",
    label: "Chef",
    subtitle: "Update kitchen stock",
    email: "chef@example.com",
    ring: "ring-green-500",
  },
  {
    id: "kps",
    label: "Kps",
    subtitle: "Admin & settings",
    email: "admin@example.com",
    ring: "ring-neutral-800",
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

function AvatarFace({ id }: { id: PersonaId }) {
  if (id === "head_chef") {
    return (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
        <circle cx="40" cy="40" r="40" fill="#f97316" />
        <circle cx="40" cy="36" r="16" fill="#fff7ed" />
        <ellipse cx="40" cy="62" rx="22" ry="14" fill="#fff7ed" />
        <path
          d="M22 28c4-10 12-14 18-14s14 4 18 14"
          fill="none"
          stroke="#9a3412"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M28 22c6-4 18-4 24 0"
          fill="none"
          stroke="#c2410c"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="34" cy="36" r="2.2" fill="#9a3412" />
        <circle cx="46" cy="36" r="2.2" fill="#9a3412" />
        <path
          d="M35 44c2.5 2.5 7.5 2.5 10 0"
          fill="none"
          stroke="#9a3412"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (id === "chef") {
    return (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
        <circle cx="40" cy="40" r="40" fill="#22c55e" />
        <circle cx="40" cy="38" r="15" fill="#f0fdf4" />
        <ellipse cx="40" cy="64" rx="20" ry="13" fill="#f0fdf4" />
        <path
          d="M26 30c0-8 6-14 14-14s14 6 14 14"
          fill="#fff"
          stroke="#166534"
          strokeWidth="2"
        />
        <circle cx="34" cy="34" r="6" fill="#fff" stroke="#166534" strokeWidth="1.5" />
        <circle cx="46" cy="34" r="6" fill="#fff" stroke="#166534" strokeWidth="1.5" />
        <circle cx="40" cy="28" r="6" fill="#fff" stroke="#166534" strokeWidth="1.5" />
        <circle cx="34" cy="38" r="2" fill="#14532d" />
        <circle cx="46" cy="38" r="2" fill="#14532d" />
        <path
          d="M35 46c2.5 2 7.5 2 10 0"
          fill="none"
          stroke="#14532d"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <circle cx="40" cy="40" r="40" fill="#262626" />
      <circle cx="40" cy="36" r="15" fill="#f5f5f5" />
      <ellipse cx="40" cy="62" rx="20" ry="13" fill="#f5f5f5" />
      <path
        d="M25 30c2-8 8-12 15-12s13 4 15 12"
        fill="#404040"
      />
      <rect x="28" y="34" width="24" height="8" rx="2" fill="#171717" opacity="0.85" />
      <circle cx="34" cy="38" r="1.8" fill="#f5f5f5" />
      <circle cx="46" cy="38" r="1.8" fill="#f5f5f5" />
      <path
        d="M35 46c2.5 2 7.5 2 10 0"
        fill="none"
        stroke="#525252"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
          {persona
            ? `Sign in as ${persona.label}`
            : "Who’s logging in?"}
        </p>

        {!persona ? (
          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 p-3 transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98] sm:p-4"
              >
                <span
                  className={`block h-20 w-20 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-white transition group-hover:ring-4 sm:h-24 sm:w-24 ${p.ring}`}
                >
                  <AvatarFace id={p.id} />
                </span>
                <span className="text-center">
                  <span className="block text-sm font-semibold text-neutral-900 sm:text-base">
                    {p.label}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] leading-tight text-neutral-400 sm:block">
                    {p.subtitle}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-6 flex items-center gap-4">
              <span
                className={`block h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-white ${persona.ring}`}
              >
                <AvatarFace id={persona.id} />
              </span>
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
