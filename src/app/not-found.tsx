import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSettings } from "@/lib/data";
import { DEFAULT_SETTINGS } from "@/lib/settings-schema";

// A 404 in the voice of the home page: a prompt that found nothing, and two ways forward.
export default async function NotFound() {
  const settings = await getSettings().catch(() => DEFAULT_SETTINGS);
  return (
    <div className="site">
      <SiteHeader />
      <main className="lw nf" dir="rtl" lang="he">
        <span className="m">ERROR 404 · PAGE NOT FOUND</span>
        <div className="np" aria-hidden>
          <span className="t">תביא לי את העמוד הזה</span>
          <span className="k">
            <span className="ltr">←</span>
          </span>
        </div>
        <div className="ai">
          <span className="av" aria-hidden>
            <i />
          </span>
          <p>
            <span style={{ color: "inherit" }}>
              <b style={{ fontWeight: 500 }}>הדף לא נמצא.</b> חיפשתי בכל מקום. העמוד הזה לא קיים, או שהקישור השתנה.
            </span>
            <br />
            <span>אולי זה עוזר:</span>
          </p>
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
    </div>
  );
}
