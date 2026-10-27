import type { Metadata } from "next";
import { ConfirmForm } from "./ConfirmForm";

export const metadata: Metadata = { title: "אישור הרשמה", robots: { index: false } };

// The email link opens this page and the visitor confirms with a button (POST),
// so link scanners in mail clients can't confirm on someone's behalf.
export default async function ConfirmPage(props: PageProps<"/subscribe/confirm">) {
  const { token } = await props.searchParams;
  return (
    <div className="mx-auto grid max-w-[560px] gap-4 px-4 py-20">
      <h1 className="font-display text-[64px] leading-[0.9] text-forest">רק עוד לחיצה</h1>
      <ConfirmForm token={typeof token === "string" ? token : ""} />
    </div>
  );
}
