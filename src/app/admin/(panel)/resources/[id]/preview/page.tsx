import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/ResourceArticle";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getById, getSettings, listRelated } from "@/lib/data";

export const dynamic = "force-dynamic";

// Renders the saved version with the exact public components, whatever its status.
export default async function PreviewPage(props: PageProps<"/admin/resources/[id]/preview">) {
  const { id } = await props.params;
  const r = await getById(id);
  if (!r) notFound();
  const [settings, related] = await Promise.all([getSettings(), listRelated(r)]);
  return (
    <div className="bg-bg">
      <div className="flex flex-wrap items-center justify-center gap-3 bg-lime px-4 py-2 text-[14px] font-bold">
        תצוגה מקדימה של הגרסה השמורה{r.status !== "published" && " · הדף עוד לא באוויר"}
        <Link href={`/admin/resources/${r.id}`} className="underline">
          חזרה לעריכה
        </Link>
      </div>
      <SiteHeader settings={settings} />
      <ResourceArticle resource={r} settings={settings} related={related} />
      <SiteFooter settings={settings} />
    </div>
  );
}
