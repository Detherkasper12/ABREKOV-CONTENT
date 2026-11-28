"use client";

import Link from "next/link";

// Something failed on the server (most often: the database is asleep). Say it plainly and offer a retry.
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="site">
      <main className="lw nf" dir="rtl" lang="he">
        <span className="m">ERROR · SOMETHING BROKE</span>
        <h1 className="F" style={{ fontSize: "clamp(40px,7vw,88px)", lineHeight: 1 }}>
          משהו נתקע בצד שלנו
        </h1>
        <p style={{ fontSize: 20, lineHeight: 1.5, maxWidth: "50ch", color: "var(--soft)" }}>
          הדף לא נטען, וזו לא אשמתך. בדרך כלל זה עובר אחרי רגע. אפשר לנסות שוב, או לחזור לדף הבית.
        </p>
        <div className="ctas">
          <button type="button" className="btn solid" onClick={reset}>
            לנסות שוב
          </button>
          <Link className="btn" href="/">
            לדף הבית
          </Link>
        </div>
      </main>
    </div>
  );
}
