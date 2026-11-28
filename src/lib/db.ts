import "server-only";
import postgres from "postgres";
import { seedBundledGuides } from "./bundled-guides";

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

// Additive columns added after the first release (supabase/migrations/0002_resource_file.sql, 0003_unlisted.sql, 0004_waitlist.sql).
// Applied once per server instance before the first read or write, so a deploy never waits on a manual SQL step.
// Guides bundled in the repo are seeded right after (see bundled-guides.ts).
let schemaReady: Promise<unknown> | undefined;
export function ensureSchema() {
  schemaReady ??= db()
    .unsafe(
      `alter table resources add column if not exists file_url text not null default '';
       alter table resources add column if not exists file_name text not null default '';
       alter table resources add column if not exists file_size bigint not null default 0;
       alter table resources add column if not exists unlisted boolean not null default false;
       create table if not exists waitlist (
         id uuid primary key default gen_random_uuid(),
         list text not null default 'agents-course',
         name text not null check (length(name) <= 80),
         contact text not null check (length(contact) <= 120),
         wish text not null default '' check (length(wish) <= 500),
         consent_text text not null,
         ip_hash text not null default '',
         created_at timestamptz not null default now()
       );
       alter table waitlist enable row level security;`,
    )
    .then(() => seedBundledGuides(db()))
    .catch((e) => {
      schemaReady = undefined;
      throw e;
    });
  return schemaReady;
}
