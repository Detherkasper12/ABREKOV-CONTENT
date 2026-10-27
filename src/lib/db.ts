import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;
const globalForDb = globalThis as unknown as { __abrekovSql?: Sql };

// DATABASE_URL wins; POSTGRES_URL is what the Supabase integration on Vercel sets
// (the transaction pooler). Its `supa` query flag is for the Supabase dashboard and
// would otherwise be sent to the server as a startup parameter.
function connectionUrl(): string | undefined {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!raw) return undefined;
  const url = new URL(raw);
  url.searchParams.delete("supa");
  return url.toString();
}

// One pooled client per server instance. `prepare: false` keeps it compatible
// with Supabase's transaction pooler (port 6543), which Vercel functions should use.
export function db(): Sql {
  if (!globalForDb.__abrekovSql) {
    const url = connectionUrl();
    if (!url) throw new Error("DATABASE_URL (or POSTGRES_URL) is not set");
    globalForDb.__abrekovSql = postgres(url, {
      prepare: false,
      max: 5,
      idle_timeout: 20,
      transform: postgres.camel,
    });
  }
  return globalForDb.__abrekovSql;
}
