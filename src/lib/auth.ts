import "server-only";
import { redirect } from "next/navigation";
import { createAuthClient } from "./supabase/server";

export function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

// getUser() validates the token with Supabase Auth on every call, so a forged
// or expired cookie never passes. Every admin page and Server Action calls this.
export async function getAdmin() {
  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminEmail(data.user.email)) return null;
  return data.user;
}

export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
