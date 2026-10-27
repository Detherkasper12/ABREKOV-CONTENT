import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;
const globalForDb = globalThis as unknown as { __abrekovSql?: Sql };

// One pooled client per server instance. `prepare: false` keeps it compatible
// with Supabase's transaction pooler (port 6543), which Vercel functions should use.
export function db(): Sql {
  if (!globalForDb.__abrekovSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    globalForDb.__abrekovSql = postgres(url, {
      prepare: false,
      max: 5,
      idle_timeout: 20,
      transform: postgres.camel,
    });
  }
  return globalForDb.__abrekovSql;
}
