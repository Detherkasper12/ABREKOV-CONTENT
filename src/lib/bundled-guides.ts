import "server-only";
import type postgres from "postgres";
import { blocksSchema } from "./blocks";
import claudeStopGuessing from "@/content/guides/claude-stop-guessing.json";

// Guides shipped in the repo (src/content/guides/*.json). Each one is inserted into the
// database once, on the first request after the deploy that adds it, so publishing a new
// guide needs only a merged PR and no SQL pasted by hand. The guide_seeds table remembers
// which slugs were seeded, so a guide edited or deleted in the admin is never re-created.
const GUIDES = [claudeStopGuessing];

type Guide = (typeof GUIDES)[number];

export async function seedBundledGuides(sql: ReturnType<typeof postgres>) {
  await sql.unsafe(
    `create table if not exists guide_seeds (slug text primary key, seeded_at timestamptz not null default now());
     alter table guide_seeds enable row level security;`,
  );
  for (const g of GUIDES as Guide[]) {
    const blocks = blocksSchema.parse(g.blocks);
    await sql.begin(async (tx) => {
      const fresh = await tx`insert into guide_seeds (slug) values (${g.slug}) on conflict do nothing returning slug`;
      if (fresh.length === 0) return;
      await tx`
        insert into resources (slug, title, description, label, keyword, category, tags, kind, featured, unlisted, status, published_at, blocks)
        values (${g.slug}, ${g.title}, ${g.description}, ${g.label}, ${g.keyword}, ${g.category}, ${g.tags}, ${g.kind},
                ${g.featured}, ${g.unlisted}, 'published', now(), ${tx.json(blocks as never)})
        on conflict (slug) do nothing`;
    });
  }
}
