-- Adds mission_people table used by Missions and Mission Detail UI.
-- Supports editable people rows and accurate people counts per mission.

create table if not exists public.mission_people (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  name text not null default '',
  role text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mission_people_mission_id_idx on public.mission_people(mission_id);

alter table public.mission_people enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_people'
      and policyname = 'Allow authenticated full access to mission_people'
  ) then
    create policy "Allow authenticated full access to mission_people"
      on public.mission_people
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_mission_people_updated_at on public.mission_people;
create trigger set_mission_people_updated_at
before update on public.mission_people
for each row
execute function public.set_updated_at();
