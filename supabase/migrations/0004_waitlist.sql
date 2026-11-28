-- Course waitlist (/agents). Additive only; the app also applies it on the first read or write.
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
alter table waitlist enable row level security;
