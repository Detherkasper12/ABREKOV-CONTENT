import { getPublishedBySlug } from "@/lib/data";
import { siteUrl } from "@/lib/email";
import { resourceToMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

// The whole free resource as one Markdown file. Paid listings only have a public preview,
// so they are not offered as a download.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const r = await getPublishedBySlug(slug);
  if (!r || r.kind === "paid") return new Response("Not found", { status: 404 });
  const body = resourceToMarkdown(r, `${siteUrl()}/resources/${r.slug}`);
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${r.slug}.md"`,
      "cache-control": "no-store",
    },
  });
}
