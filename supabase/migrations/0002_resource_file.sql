-- Main downloadable file of a free resource. Additive only; the app also applies it on first save.
alter table resources add column if not exists file_url text not null default '';
alter table resources add column if not exists file_name text not null default '';
alter table resources add column if not exists file_size bigint not null default 0;
