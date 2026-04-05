-- Run after initial schema. Adds mutual-match messaging, student prerequisites, weekly schedule.

-- ---------------------------------------------------------------------------
-- Student profile extensions (shadowing goals, prior experience)
-- ---------------------------------------------------------------------------
alter table public.student_hours
  add column if not exists shadowing_goals text default '' not null;

alter table public.student_hours
  add column if not exists previous_shadowing_experience text default '' not null;

-- ---------------------------------------------------------------------------
-- Doctor preference fields (dress code, meeting point, readings)
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists dress_code_preferences text default '' not null;

alter table public.profiles add column if not exists meeting_point_preferences text default '' not null;

alter table public.profiles add column if not exists pre_shadowing_readings text default '' not null;

-- ---------------------------------------------------------------------------
-- Matches: both parties must accept before messaging (conversation linked)
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid (),
  student_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  student_accepted_at timestamptz,
  doctor_accepted_at timestamptz,
  created_at timestamptz default now() not null,
  unique (student_id, doctor_id)
);

create index if not exists matches_student_idx on public.matches (student_id);
create index if not exists matches_doctor_idx on public.matches (doctor_id);

-- ---------------------------------------------------------------------------
-- Conversations tied to an active match (messaging only after mutual accept)
-- ---------------------------------------------------------------------------
alter table public.conversations add column if not exists match_id uuid references public.matches (id) on delete cascade;

create unique index if not exists conversations_one_per_match on public.conversations (match_id)
where
  match_id is not null;

-- ---------------------------------------------------------------------------
-- Student prerequisite documents (required before requesting a match)
-- ---------------------------------------------------------------------------
create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid (),
  student_id uuid not null references public.profiles (id) on delete cascade,
  requirement_key text not null,
  file_url text not null,
  file_name text,
  created_at timestamptz default now() not null,
  unique (student_id, requirement_key)
);

create index if not exists student_documents_student_idx on public.student_documents (student_id);

-- ---------------------------------------------------------------------------
-- Doctor week grid: AM/PM half-days (0 = Sunday … 6 = Saturday)
-- ---------------------------------------------------------------------------
create table if not exists public.doctor_week_half_slots (
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null check (
    day_of_week >= 0
    and day_of_week <= 6
  ),
  half_day text not null check (half_day in ('am', 'pm')),
  is_available boolean default false not null,
  primary key (doctor_id, day_of_week, half_day)
);

-- Optional labeled items (procedure, clinic block, etc.) per cell
create table if not exists public.doctor_schedule_items (
  id uuid primary key default gen_random_uuid (),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null check (
    day_of_week >= 0
    and day_of_week <= 6
  ),
  half_day text not null check (half_day in ('am', 'pm')),
  title text not null,
  details text default '' not null,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists doctor_schedule_items_lookup on public.doctor_schedule_items (doctor_id, day_of_week, half_day);

-- Storage: create bucket `student-forms` (policies in dashboard — users upload own folder).
