-- Shadowing opportunities posted by doctors (browse + manage).

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid (),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists opportunities_doctor_idx on public.opportunities (doctor_id);
create index if not exists opportunities_active_idx on public.opportunities (is_active)
where
  is_active = true;

alter table public.opportunities enable row level security;

-- Authenticated users can read active listings (adjust if you want public anon read).
create policy "opportunities_select_active"
  on public.opportunities for select
  using (
    is_active = true
    or doctor_id = (select auth.uid ())
  );

create policy "opportunities_insert_own"
  on public.opportunities for insert
  with check (
    doctor_id = (select auth.uid ())
    and exists (
      select 1
      from public.profiles p
      where
        p.id = (select auth.uid ())
        and p.role = 'doctor'
    )
  );

create policy "opportunities_update_own"
  on public.opportunities for update
  using (doctor_id = (select auth.uid ()))
  with check (doctor_id = (select auth.uid ()));

create policy "opportunities_delete_own"
  on public.opportunities for delete
  using (doctor_id = (select auth.uid ()));
