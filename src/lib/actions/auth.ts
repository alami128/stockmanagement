"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface LoginState {
  error: string | null;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  return signInWithCredentials(email, password);
}

const DEMO_PASSWORD = "kitchen123";

const QUICK_LOGIN_EMAIL: Record<"chef" | "head_chef", string> = {
  chef: "chef@example.com",
  head_chef: "seniorchef@example.com",
};

export async function quickLogin(persona: "chef" | "head_chef"): Promise<LoginState> {
  const email = QUICK_LOGIN_EMAIL[persona];
  return signInWithCredentials(email, DEMO_PASSWORD);
}

async function signInWithCredentials(
  email: string,
  password: string
): Promise<LoginState> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Could not sign in. Check the account exists in Supabase." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  const home =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "senior_chef"
        ? "/senior-chef"
        : "/chef";

  redirect(home);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
