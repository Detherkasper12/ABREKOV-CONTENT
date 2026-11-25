-- Per-guide secret key. Empty = open to everyone; set = the guide opens only through its personal link.
-- Additive only; the app also applies it on the first read or write.
alter table resources add column if not exists access_key text not null default '';
