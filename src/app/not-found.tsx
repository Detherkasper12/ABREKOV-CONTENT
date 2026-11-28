import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Typo } from "@/components/Typo";
import { getSettings } from "@/lib/data";
import { DEFAULT_SETTINGS } from "@/lib/settings-schema";

// A 404 in the voice of the home page: a prompt that found nothing, and two ways forward.
export default async function NotFound() {
  // Prerendered at build without the database (it is refreshed from it within the hour).
  const settings = process.env.NEXT_PHASE === "phase-production-build" ? DEFAULT_SETTINGS : await getSettings().catch(() => DEFAULT_SETTINGS);
  return (
    <div className="site">
      <SiteHeader settings={settings} />
      <main className="lw nf" dir="rtl" lang="he">
        <span className="m">ERROR 404 · PAGE NOT FOUND</span>
        <div className="np" aria-hidden>
          <span className="t">תביא לי את העמוד הזה</span>
          <span className="k">
            <ArrowIcon />
          </span>
        </div>
        <div className="ai">
          <span className="av" aria-hidden>
            <i />
          </span>
          <div>
            <p>
              <b style={{ fontWeight: 500 }}>הדף לא נמצא.</b> חיפשתי בכל מקום. העמוד הזה לא קיים, או שהקישור השתנה.
            </p>
            <p className="mu">אולי זה עוזר:</p>
          </div>
        </div>
        <div className="ctas">
          <Link className="btn solid" href="/">
            לדף הבית
          </Link>
          <Link className="btn" href="/resources">
            לכל המדריכים
          </Link>
        </div>
      </main>
      <SiteFooter settings={settings} />
      <Typo />
    </div>
  );
}
