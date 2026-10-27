"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmSubscription } from "../../newsletter-actions";

export function ConfirmForm({ token }: { token: string }) {
  const [result, action, pending] = useActionState(confirmSubscription, null);
  if (result === true) {
    return (
      <div className="grid gap-3">
        <p className="text-[19px] font-bold">נרשמת. מהיום תקבל ממני כלים ומדריכים חדשים.</p>
        <Link href="/" className="font-bold text-forest underline">
          חזרה למשאבים
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="grid justify-items-start gap-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-[18px]">לחץ על הכפתור כדי לאשר שאתה רוצה לקבל מיילים מ־ABREKOV.</p>
      {result === false && <p className="font-bold text-danger">הקישור לא תקין או שפג תוקפו. אפשר להירשם שוב מדף הבית.</p>}
      <button disabled={pending || !token} className="rounded-full bg-forest px-6 py-3 font-extrabold text-lime disabled:opacity-60">
        {pending ? "מאשר…" : "אשר הרשמה"}
      </button>
    </form>
  );
}
