-- Link-only guides: reachable by direct URL, hidden from the library, search, related and sitemap.
-- Additive only; the app also applies it on the first read or write.
alter table resources add column if not exists unlisted boolean not null default false;
