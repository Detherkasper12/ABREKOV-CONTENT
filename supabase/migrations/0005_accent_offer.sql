-- Per-guide colour (palette key) and the single offer shown at the end of a guide.
-- Also applied automatically by ensureSchema() in src/lib/db.ts.
alter table resources add column if not exists accent text not null default '';
alter table resources add column if not exists offer text not null default '';
