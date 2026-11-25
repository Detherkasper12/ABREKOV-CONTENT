import { cookies } from "next/headers";
import { accessCookieName, keysMatch } from "@/lib/access";
import { getPublishedBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

// The personal link sent in the DM. A valid key unlocks the guide on this device and the visitor
// lands on the clean URL, so the address bar never contains the key.
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const key = new URL(req.url).searchParams.get("k") ?? "";
  const r = await getPublishedBySlug(slug);
  if (r && keysMatch(key, r.accessKey)) {
    (await cookies()).set(accessCookieName(r.slug), key, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/resources/${r.slug}`,
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return new Response(null, { status: 303, headers: { location: `/resources/${slug}`, "cache-control": "no-store" } });
}
