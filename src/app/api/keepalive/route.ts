import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Called once a day by the Vercel cron in vercel.json. Free Supabase projects are paused
// after a week without database activity, which takes the whole site down.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await db()`select 1 from resources limit 1`;
  return Response.json({ ok: true });
}
