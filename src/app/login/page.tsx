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
  avatarSrc: string;
}

const PERSONAS: Persona[] = [
  {
    id: "chef",
    label: "Chef",
    subtitle: "Update kitchen stock",
    email: "chef@example.com",
    ring: "ring-blue-500",
    avatarSrc: "/avatars/chef.png",
  },
  {
    id: "head_chef",
    label: "Head Chef",
    subtitle: "Stock overview & orders",
    email: "seniorchef@example.com",
    ring: "ring-green-500",
    avatarSrc: "/avatars/head-chef.png",
  },
  {
    id: "kps",
    label: "Kps",
    subtitle: "Admin & settings",
    email: "admin@example.com",
    ring: "ring-red-500",
    avatarSrc: "/avatars/kps.png",
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

function RoleAvatar({
  src,
  label,
  className = "",
}: {
  src: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`block overflow-hidden rounded-full bg-black ${className}`}
    >
      <img
        src={src}
        alt={label}
        width={150}
        height={150}
        className="h-full w-full scale-110 object-cover"
        draggable={false}
      />
    </span>
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
          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 p-3 transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98] sm:p-4"
              >
                <span
                  className={`rounded-full ring-2 ring-offset-2 ring-offset-white transition group-hover:ring-4 ${p.ring}`}
                >
                  <RoleAvatar
                    src={p.avatarSrc}
                    label={p.label}
                    className="h-24 w-24 sm:h-28 sm:w-28"
                  />
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
                className={`rounded-full ring-2 ring-offset-2 ring-offset-white ${persona.ring}`}
              >
                <RoleAvatar
                  src={persona.avatarSrc}
                  label={persona.label}
                  className="h-20 w-20"
                />
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
