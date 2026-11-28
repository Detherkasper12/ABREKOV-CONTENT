import { Library } from "@/components/Library";
import { SiteShell } from "@/components/SiteShell";
import { getSettings, listPublished } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "מדריכים",
  description: "כל המדריכים של ABREKOV: הפרומפטים להעתקה, הקבצים להורדה וכל השלבים. חינם, בלי הרשמה.",
  alternates: { canonical: "/resources" },
};

export default async function LibraryPage(props: PageProps<"/resources">) {
  const [settings, resources, sp] = await Promise.all([getSettings(), listPublished(), props.searchParams]);
  const home = settings.home;
  return (
    <SiteShell settings={settings} current="library">
      <div className="lw">
        <header className="page-h">
          <span className="m">FREE GUIDES · {String(resources.length).padStart(2, "0")}</span>
          <h1 className="F">{home.libraryTitle}</h1>
          {home.libraryText && <p>{home.libraryText}</p>}
        </header>
        <Library resources={resources} categories={settings.categories} initialCategory={typeof sp.category === "string" ? sp.category : ""} />
        <p className="note-dm">
          <i aria-hidden />
          מדריכים שנשלחים בהודעה פרטית לא מופיעים כאן. הם נפתחים רק מהקישור.
        </p>
      </div>
    </SiteShell>
  );
}
