-- =============================================================================
-- Synapse / premed-networking — COMPLETE Supabase database + RLS + Storage
-- =============================================================================
-- Run this entire script once in the Supabase SQL Editor (new or existing project).
-- It is idempotent: safe to re-run; uses IF NOT EXISTS / DROP POLICY IF EXISTS.
--
-- After SQL: create Storage buckets in Dashboard if INSERT below fails, then run
-- only the Storage policies section — or fix bucket names to match.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions (uuid generation)
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. profiles (auth-linked; students + doctors; weekly schedule JSONB here)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'doctor')),
  email text,
  full_name text default '' not null,
  avatar_url text,
  headline text default '' not null,
  bio text default '' not null,
  location text default '' not null,
  lat double precision,
  lng double precision,
  specialty text,
  organization text,
  open_to_shadowing boolean,
  availability_status text check (
    availability_status is null
    or availability_status in ('available', 'limited', 'not_available')
  ),
  areas_of_focus text[] default '{}'::text[] not null,
  doctor_interests text[] default '{}'::text[] not null,
  dress_code_preferences text default '' not null,
  meeting_point_preferences text default '' not null,
  pre_shadowing_readings text default '' not null,
  availability_schedule jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Optional / legacy columns the app may read via normalizeProfileRowForForm (no-ops if already present)
alter table public.profiles add column if not exists hospital text;
alter table public.profiles add column if not exists organization_name text;
alter table public.profiles add column if not exists hospital_name text;
alter table public.profiles add column if not exists photo_url text;
alter table public.profiles add column if not exists shadowing_available boolean default false;
alter table public.profiles add column if not exists availability jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists week_availability jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists neighborhood text;
alter table public.profiles add column if not exists dress_preferences text;
alter table public.profiles add column if not exists check_in_instructions text;
alter table public.profiles add column if not exists check_in_details text;
alter table public.profiles add column if not exists pre_shadowing_readings_and_papers text;
alter table public.profiles add column if not exists focus_areas text;
alter table public.profiles add column if not exists mentoring_topics text;
alter table public.profiles add column if not exists interests text;
alter table public.profiles add column if not exists tags text;
alter table public.profiles add column if not exists skills text;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_lat_lng_idx on public.profiles (lat, lng)
where lat is not null and lng is not null;

-- -----------------------------------------------------------------------------
-- 2. student_hours (1:1 student profile extension)
-- -----------------------------------------------------------------------------
create table if not exists public.student_hours (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  shadowing_hours integer default 0 not null,
  clinical_hours integer default 0 not null,
  volunteer_hours integer default 0 not null,
  year text,
  major text default '' not null,
  medical_interest text default '' not null,
  research_experience text default '' not null,
  interests text[] default '{}'::text[] not null,
  skills text[] default '{}'::text[] not null,
  saved_doctor_ids uuid[] default '{}'::uuid[] not null,
  shadowing_goals text default '' not null,
  previous_shadowing_experience text default '' not null,
  updated_at timestamptz default now() not null
);

-- -----------------------------------------------------------------------------
-- 3. meeting_slots + bookings (intro slots; app reads slots — booking widget does not persist yet)
-- -----------------------------------------------------------------------------
create table if not exists public.meeting_slots (
  id uuid primary key default gen_random_uuid (),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  booked_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists meeting_slots_doctor_idx on public.meeting_slots (doctor_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid (),
  slot_id uuid not null references public.meeting_slots (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  status text default 'confirmed' not null check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now() not null,
  unique (slot_id)
);

-- -----------------------------------------------------------------------------
-- 4. matches (mutual accept before messaging)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5. conversations (linked to match) + participants + messages
-- -----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid (),
  created_at timestamptz default now() not null,
  last_message_at timestamptz,
  last_message_preview text,
  match_id uuid references public.matches (id) on delete cascade
);

create unique index if not exists conversations_one_per_match on public.conversations (match_id)
where match_id is not null;

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  unread_count integer default 0 not null,
  primary key (conversation_id, profile_id)
);

create index if not exists convo_participant_profile_idx on public.conversation_participants (profile_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid (),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz default now() not null,
  read_at timestamptz
);

create index if not exists messages_conversation_idx on public.messages (conversation_id);

-- -----------------------------------------------------------------------------
-- 6. student_documents (prerequisite uploads)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 7. opportunities (doctor listings; PostgREST embed: profiles)
-- -----------------------------------------------------------------------------
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
where is_active = true;

-- -----------------------------------------------------------------------------
-- 8. Drop legacy weekly tables if they still exist (app uses profiles.availability_schedule)
-- -----------------------------------------------------------------------------
drop table if exists public.doctor_schedule_items cascade;
drop table if exists public.doctor_week_half_slots cascade;

-- =============================================================================
-- Helper: avoid RLS recursion on conversation_participants (Postgres re-checks RLS in subqueries)
-- =============================================================================
create or replace function public.current_user_conversation_ids ()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select cp.conversation_id
  from public.conversation_participants cp
  where cp.profile_id = (select auth.uid ());
$$;

grant execute on function public.current_user_conversation_ids () to authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY — enable + policies (idempotent drops)
-- =============================================================================

-- --- profiles ---
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- --- student_hours ---
alter table public.student_hours enable row level security;

drop policy if exists "student_hours_select" on public.student_hours;
create policy "student_hours_select"
  on public.student_hours for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'doctor'
    )
  );

drop policy if exists "student_hours_insert_own" on public.student_hours;
create policy "student_hours_insert_own"
  on public.student_hours for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "student_hours_update_own" on public.student_hours;
create policy "student_hours_update_own"
  on public.student_hours for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- --- meeting_slots ---
alter table public.meeting_slots enable row level security;

drop policy if exists "meeting_slots_select_all" on public.meeting_slots;
create policy "meeting_slots_select_all"
  on public.meeting_slots for select
  to anon, authenticated
  using (true);

drop policy if exists "meeting_slots_write_doctor" on public.meeting_slots;
create policy "meeting_slots_write_doctor"
  on public.meeting_slots for insert
  to authenticated
  with check (
    doctor_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'doctor')
  );

drop policy if exists "meeting_slots_update_doctor" on public.meeting_slots;
create policy "meeting_slots_update_doctor"
  on public.meeting_slots for update
  to authenticated
  using (doctor_id = (select auth.uid()))
  with check (doctor_id = (select auth.uid()));

drop policy if exists "meeting_slots_delete_doctor" on public.meeting_slots;
create policy "meeting_slots_delete_doctor"
  on public.meeting_slots for delete
  to authenticated
  using (doctor_id = (select auth.uid()));

-- --- bookings (reserved for future server-side booking flow) ---
alter table public.bookings enable row level security;

drop policy if exists "bookings_select_parties" on public.bookings;
create policy "bookings_select_parties"
  on public.bookings for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or doctor_id = (select auth.uid())
  );

drop policy if exists "bookings_insert_student" on public.bookings;
create policy "bookings_insert_student"
  on public.bookings for insert
  to authenticated
  with check (student_id = (select auth.uid()));

-- --- matches ---
alter table public.matches enable row level security;

drop policy if exists "matches_select_parties" on public.matches;
create policy "matches_select_parties"
  on public.matches for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or doctor_id = (select auth.uid())
  );

drop policy if exists "matches_insert_student" on public.matches;
create policy "matches_insert_student"
  on public.matches for insert
  to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student')
  );

drop policy if exists "matches_update_parties" on public.matches;
create policy "matches_update_parties"
  on public.matches for update
  to authenticated
  using (
    student_id = (select auth.uid())
    or doctor_id = (select auth.uid())
  )
  with check (
    student_id = (select auth.uid())
    or doctor_id = (select auth.uid())
  );

drop policy if exists "matches_delete_parties" on public.matches;
create policy "matches_delete_parties"
  on public.matches for delete
  to authenticated
  using (
    student_id = (select auth.uid())
    or doctor_id = (select auth.uid())
  );

-- --- student_documents ---
alter table public.student_documents enable row level security;

drop policy if exists "student_documents_select_own" on public.student_documents;
create policy "student_documents_select_own"
  on public.student_documents for select
  to authenticated
  using (student_id = (select auth.uid()));

drop policy if exists "student_documents_insert_own" on public.student_documents;
create policy "student_documents_insert_own"
  on public.student_documents for insert
  to authenticated
  with check (student_id = (select auth.uid()));

drop policy if exists "student_documents_update_own" on public.student_documents;
create policy "student_documents_update_own"
  on public.student_documents for update
  to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

drop policy if exists "student_documents_delete_own" on public.student_documents;
create policy "student_documents_delete_own"
  on public.student_documents for delete
  to authenticated
  using (student_id = (select auth.uid()));

-- --- conversations ---
alter table public.conversations enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select
  to authenticated
  using (id in (select public.current_user_conversation_ids ()));

drop policy if exists "conversations_insert_match_party" on public.conversations;
create policy "conversations_insert_match_party"
  on public.conversations for insert
  to authenticated
  with check (
    match_id is not null
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.student_id = (select auth.uid()) or m.doctor_id = (select auth.uid()))
    )
  );

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update
  to authenticated
  using (id in (select public.current_user_conversation_ids ()))
  with check (id in (select public.current_user_conversation_ids ()));

-- --- conversation_participants ---
alter table public.conversation_participants enable row level security;

drop policy if exists "conv_part_select_member" on public.conversation_participants;
create policy "conv_part_select_member"
  on public.conversation_participants for select
  to authenticated
  using (conversation_id in (select public.current_user_conversation_ids ()));

drop policy if exists "conv_part_insert_match_party" on public.conversation_participants;
create policy "conv_part_insert_match_party"
  on public.conversation_participants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches m
      inner join public.conversations c on c.match_id = m.id and c.id = conversation_participants.conversation_id
      where (m.student_id = (select auth.uid()) or m.doctor_id = (select auth.uid()))
        and (profile_id = m.student_id or profile_id = m.doctor_id)
    )
  );

-- --- messages ---
alter table public.messages enable row level security;

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages for select
  to authenticated
  using (conversation_id in (select public.current_user_conversation_ids ()));

drop policy if exists "messages_insert_sender_participant" on public.messages;
create policy "messages_insert_sender_participant"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and conversation_id in (select public.current_user_conversation_ids ())
  );

-- --- opportunities ---
alter table public.opportunities enable row level security;

drop policy if exists "opportunities_select_active" on public.opportunities;
create policy "opportunities_select_active"
  on public.opportunities for select
  to anon, authenticated
  using (
    is_active = true
    or doctor_id = (select auth.uid())
  );

drop policy if exists "opportunities_insert_own" on public.opportunities;
create policy "opportunities_insert_own"
  on public.opportunities for insert
  to authenticated
  with check (
    doctor_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'doctor'
    )
  );

drop policy if exists "opportunities_update_own" on public.opportunities;
create policy "opportunities_update_own"
  on public.opportunities for update
  to authenticated
  using (doctor_id = (select auth.uid()))
  with check (doctor_id = (select auth.uid()));

drop policy if exists "opportunities_delete_own" on public.opportunities;
create policy "opportunities_delete_own"
  on public.opportunities for delete
  to authenticated
  using (doctor_id = (select auth.uid()));

-- =============================================================================
-- STORAGE: buckets + object policies (run after buckets exist)
-- =============================================================================
-- App paths:
--   avatars:        "{userId}/{timestamp}-{filename}"
--   student-forms:  "{userId}/{requirementKey}/{timestamp}-{filename}"
--
-- Buckets: avatars = public read; student-forms = public read so getPublicUrl() works in the app.
--         Upload restricted to own user-id prefix. Tighten later with signed URLs if needed.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, null)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-forms', 'student-forms', true, 20971520, null)
on conflict (id) do update set public = excluded.public;

-- --- avatars objects ---
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  );

-- --- student-forms objects ---
drop policy if exists "student_forms_public_read" on storage.objects;
create policy "student_forms_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'student-forms');

drop policy if exists "student_forms_insert_own" on storage.objects;
create policy "student_forms_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'student-forms'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  );

drop policy if exists "student_forms_update_own" on storage.objects;
create policy "student_forms_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'student-forms'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'student-forms'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  );

drop policy if exists "student_forms_delete_own" on storage.objects;
create policy "student_forms_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'student-forms'
    and (storage.foldername (name))[1] = (select auth.uid()::text)
  );

-- =============================================================================
-- Realtime (optional): messages + conversations for live inbox
-- =============================================================================
-- In Dashboard: Database → Replication → enable for `messages` and/or `conversations` if you use realtime.
