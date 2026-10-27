import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "כניסה לניהול", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="card grid w-full max-w-[400px] gap-6 p-6">
        <span className="sig text-[15px]">
          <i />
          ABREKOV
        </span>
        <h1 className="text-[26px] font-extrabold">כניסה לניהול</h1>
        <LoginForm />
      </div>
    </div>
  );
}
