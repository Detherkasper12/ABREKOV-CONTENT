import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "ניהול", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-4">
          <Link href="/admin" className="sig me-3 text-[14px]">
            <i />
            ADMIN
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-[15px] font-bold" aria-label="ניהול">
            <Link href="/admin" className="rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-bg">
              משאבים
            </Link>
            <Link href="/admin/settings" className="rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-bg">
              הגדרות האתר
            </Link>
            <Link href="/admin/subscribers" className="rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-bg">
              נרשמים
            </Link>
            <a href="/" target="_blank" className="rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-bg">
              לאתר ↗
            </a>
          </nav>
          <form action={signOut} className="flex items-center gap-3">
            <span className="ltr hidden font-mono text-[12px] text-muted md:inline">{user.email}</span>
            <button className="rounded-full px-3 py-1.5 text-[14px] font-bold text-muted hover:bg-bg hover:text-ink">יציאה</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
