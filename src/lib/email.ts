import "server-only";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

// Resend's REST API (https://resend.com/docs/api-reference/emails/send-email) via fetch, no SDK.
export async function sendEmail(to: string, subject: string, html: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.NEWSLETTER_FROM_EMAIL, to: [to], subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function confirmEmail(link: string) {
  const subject = "אישור הרשמה · ABREKOV";
  const text = `כדי להצטרף לעדכונים של ABREKOV, פתח את הקישור ולחץ על "אשר הרשמה":\n${link}\n\nלא נרשמת? פשוט תתעלם מהמייל הזה.`;
  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#F3F3F1;font-family:Arial,sans-serif;color:#16181A">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<p style="font-family:monospace;font-weight:bold;letter-spacing:2px;direction:ltr;text-align:right">ABREKOV</p>
<h1 style="font-size:24px;margin:16px 0">רק עוד לחיצה אחת</h1>
<p style="font-size:16px;line-height:1.6">כדי לקבל ממני כלים ומדריכים חדשים, תאשר את ההרשמה:</p>
<p style="margin:24px 0"><a href="${escape(link)}" style="background:#12332A;color:#D6FF3A;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">אשר הרשמה</a></p>
<p style="font-size:13px;color:#5C6166">לא נרשמת? פשוט תתעלם מהמייל הזה ולא תקבל ממני כלום.</p>
</div></body></html>`;
  return { subject, html, text };
}
