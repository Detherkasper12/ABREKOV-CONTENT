import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ConfirmForm } from "./ConfirmForm";

export const metadata: Metadata = { title: "אישור הרשמה", robots: { index: false } };

// The email link opens this page and the visitor confirms with a button (POST),
// so link scanners in mail clients can't confirm on someone's behalf.
export default async function ConfirmPage(props: PageProps<"/subscribe/confirm">) {
  const { token } = await props.searchParams;
  return (
    <SiteShell>
    <div className="lw" style={{ paddingBlock: 90, display: "grid", gap: 24, justifyItems: "start" }}>
      <h1 className="F" style={{ fontSize: "clamp(48px,8vw,96px)", lineHeight: 0.9 }}>רק עוד לחיצה</h1>
      <ConfirmForm token={typeof token === "string" ? token : ""} />
    </div>
    </SiteShell>
  );
}
