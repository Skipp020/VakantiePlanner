# VakantiePlanner

Vakantieplanner voor team Joost — teamverlofplanning zonder wachtwoorden:
je kiest je naam uit een lijst (of voegt jezelf toe) en krijgt een
sessie-cookie dat aan je rij in de database gekoppeld is.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres) als database
- Deploy op Vercel

## Datamodel

- `members`: `id`, `name`, `total_days`, `session_token`
- `leave_days`: `member_id`, `date`, `status` (1 = optie, 2 = bevestigd),
  uniek per `member_id` + `date`

Migratie: `supabase/migrations/0001_init.sql`.

## Setup

1. Maak een Supabase project aan en draai de migratie in
   `supabase/migrations/0001_init.sql` (via de SQL editor, of `supabase db push`).
2. Kopieer `.env.example` naar `.env.local` en vul de Supabase URL, anon key
   en service role key in (Project Settings → API).
3. `npm install`
4. `npm run dev`

## Hoe het inloggen werkt

Er is geen wachtwoord. Bij het kiezen of aanmaken van een naam genereert de
server een willekeurige token, slaat die op in `members.session_token` en
zet 'm in een httpOnly cookie. Bij elk bezoek wordt het lid opgezocht via
dat cookie. Alle schrijfacties lopen via Server Actions met de
service-role key, die controleren dat je alleen je eigen rij aanpast; de
anon key mag via Row Level Security alleen lezen.

## Status

Fase 1 (dit is af): scaffolding, schema + migratie, naam-login flow.
Fase 2 (volgt): het verlofrooster-grid met feestdagen en de
"tegelijk-weg"-heatmap.
