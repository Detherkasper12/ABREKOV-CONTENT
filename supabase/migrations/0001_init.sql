-- ABREKOV Resources: initial schema.
-- Run once in Supabase: Dashboard → SQL Editor → paste this file → Run.
-- The app talks to these tables only from the server (DATABASE_URL), so RLS is
-- enabled with no policies: the public anon key cannot read or write anything here.

create extension if not exists pgcrypto;

create table if not exists resources (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  title         text not null check (length(title) between 1 and 160),
  description   text not null default '' check (length(description) <= 600),
  label         text not null default '' check (length(label) <= 40),
  keyword       text not null default '' check (length(keyword) <= 40),
  cover_url     text not null default '',
  cover_alt     text not null default '',
  category      text not null default '',
  tags          text[] not null default '{}',
  kind          text not null default 'free' check (kind in ('free', 'paid')),
  price_ils     numeric(10, 2) check (price_ils is null or price_ils >= 0),
  checkout_url  text not null default '',
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured      boolean not null default false,
  seo_title     text not null default '',
  seo_description text not null default '',
  blocks        jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz
);

create index if not exists resources_status_idx on resources (status, published_at desc);

create table if not exists site_settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict do nothing;

create table if not exists subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique check (length(email) <= 254),
  status       text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  token_hash   text not null,
  consent_text text not null,
  source       text not null default '',
  ip_hash      text not null default '',
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
create index if not exists subscribers_ip_idx on subscribers (ip_hash, created_at desc);

alter table resources enable row level security;
alter table site_settings enable row level security;
alter table subscribers enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on resources, site_settings, subscribers from anon, authenticated;
  end if;

  -- Public bucket for cover images, screenshots and free downloads.
  -- Paid product files never go here: the payment provider delivers them.
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('media', 'media', true, 52428800)
    on conflict (id) do update set public = true, file_size_limit = 52428800;
  end if;
end $$;
