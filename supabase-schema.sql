-- PLASTIC PROSPECT ITALIA · VINK
-- CRM condiviso: accesso ai dati solo agli utenti Supabase Auth autenticati.

create table if not exists public.plastic_prospects (
  _id text primary key,
  regione text default '',
  provincia text default '',
  comune text default '',
  indirizzo text default '',
  azienda text not null,
  attivita text default '',
  telefono text default '',
  email text default '',
  pec text default '',
  sito text default '',
  partita_iva text default '',
  codice_fiscale text default '',
  rea text default '',
  ateco text default '',
  materiali text default '',
  interesse text default '',
  priorita integer default 0,
  stato text default 'DA CONTATTARE',
  note text default '',
  ultimo_contatto text default '',
  prossimo_contatto text default '',
  fonte text default '',
  favorite boolean default false,
  chiamato_da text default '',
  data_chiamata text default '',
  esito_chiamata text default 'DA CONTATTARE',
  prossimo_richiamo text default '',
  note_chiamata text default '',
  assegnato_a text default ''
);

create table if not exists public.plastic_meta (
  key text primary key,
  value jsonb
);

create table if not exists public.plastic_operators (
  name text primary key
);

alter table public.plastic_prospects enable row level security;
alter table public.plastic_meta enable row level security;
alter table public.plastic_operators enable row level security;

grant select, insert, update, delete on public.plastic_prospects to authenticated;
grant select, insert, update, delete on public.plastic_meta to authenticated;
grant select, insert, update, delete on public.plastic_operators to authenticated;

drop policy if exists "plastic_prospects_all" on public.plastic_prospects;
drop policy if exists "plastic_meta_all" on public.plastic_meta;
drop policy if exists "plastic_operators_all" on public.plastic_operators;

drop policy if exists "plastic_prospects_team" on public.plastic_prospects;
create policy "plastic_prospects_team"
on public.plastic_prospects
for all
to authenticated
using (true)
with check (true);

drop policy if exists "plastic_meta_team" on public.plastic_meta;
create policy "plastic_meta_team"
on public.plastic_meta
for all
to authenticated
using (true)
with check (true);

drop policy if exists "plastic_operators_team" on public.plastic_operators;
create policy "plastic_operators_team"
on public.plastic_operators
for all
to authenticated
using (true)
with check (true);

-- Aggiornamento per installazioni già esistenti
alter table public.plastic_prospects add column if not exists indirizzo text default '';
