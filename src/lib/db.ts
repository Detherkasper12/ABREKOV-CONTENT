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

// Additive columns added after the first release (supabase/migrations/0002_resource_file.sql).
// Applied once per server instance before writes, so a deploy never waits on a manual SQL step.
let schemaReady: Promise<unknown> | undefined;
export function ensureSchema() {
  schemaReady ??= db()
    .unsafe(
      `alter table resources add column if not exists file_url text not null default '';
       alter table resources add column if not exists file_name text not null default '';
       alter table resources add column if not exists file_size bigint not null default 0;`,
    )
    .catch((e) => {
      schemaReady = undefined;
      throw e;
    });
  return schemaReady;
}
