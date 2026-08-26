-- VakantiePlanner initial schema
-- Teamleden en hun verlofdagen. Geen wachtwoord-login: identiteit loopt via
-- members.session_token, dat gekoppeld wordt aan een httpOnly cookie in de app.

create extension if not exists pgcrypto;

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  total_days integer not null default 25,
  session_token text unique,
  created_at timestamptz not null default now()
);

create table if not exists leave_days (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  date date not null,
  status smallint not null check (status in (1, 2)), -- 1 = optie, 2 = bevestigd
  created_at timestamptz not null default now(),
  unique (member_id, date)
);

create index if not exists leave_days_date_idx on leave_days (date);
create index if not exists leave_days_member_id_idx on leave_days (member_id);

-- Row Level Security: iedereen mag alle rijen lezen (read-only teamoverzicht).
-- Er zijn bewust geen insert/update/delete policies voor de anon/authenticated
-- rollen: alle schrijfacties lopen via Next.js Server Actions met de
-- service-role key, die de "alleen eigen rij bewerkbaar"-regel in code afdwingt
-- op basis van het session-cookie.
alter table members enable row level security;
alter table leave_days enable row level security;

create policy "members are publicly readable"
  on members for select
  using (true);

create policy "leave_days are publicly readable"
  on leave_days for select
  using (true);
