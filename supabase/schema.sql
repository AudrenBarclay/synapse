-- Premed networking — table outline only (no RLS). For a full production-ready database
-- matching the app (RLS + Storage), run `complete_setup.sql` in the SQL Editor instead.

-- ---------------------------------------------------------------------------
-- Storage: create a public bucket named `avatars` for profile photos.
-- Policies: authenticated users can upload to their own folder `avatars/<user_id>/...`.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (students and doctors).
-- ---------------------------------------------------------------------------
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
  -- Doctor-only (nullable for students)
  specialty text,
  organization text,
  open_to_shadowing boolean,
  availability_status text check (
    availability_status is null
    or availability_status in ('available', 'limited', 'not_available')
  ),
  areas_of_focus text[] default '{}'::text[],
  doctor_interests text[] default '{}'::text[],
  dress_code_preferences text default '' not null,
  meeting_point_preferences text default '' not null,
  pre_shadowing_readings text default '' not null,
  availability_schedule jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_lat_lng_idx on public.profiles (lat, lng)
where
  lat is not null
  and lng is not null;

-- ---------------------------------------------------------------------------
-- student_hours: metrics and academic fields for students (1:1 with profiles).
-- ---------------------------------------------------------------------------
create table if not exists public.student_hours (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  shadowing_hours integer default 0 not null,
  clinical_hours integer default 0 not null,
  volunteer_hours integer default 0 not null,
  year text,
  major text default '' not null,
  medical_interest text default '' not null,
  research_experience text default '' not null,
  interests text[] default '{}'::text[],
  skills text[] default '{}'::text[],
  saved_doctor_ids uuid[] default '{}'::uuid[],
  shadowing_goals text default '' not null,
  previous_shadowing_experience text default '' not null,
  updated_at timestamptz default now() not null
);

-- ---------------------------------------------------------------------------
-- meeting_slots: bookable intro windows on doctor profiles.
-- ---------------------------------------------------------------------------
create table if not exists public.meeting_slots (
  id uuid primary key default gen_random_uuid (),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  booked_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists meeting_slots_doctor_idx on public.meeting_slots (doctor_id);

-- ---------------------------------------------------------------------------
-- bookings: optional explicit record when a slot is taken (audit trail).
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid (),
  slot_id uuid not null references public.meeting_slots (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  status text default 'confirmed' not null check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now() not null,
  unique (slot_id)
);

-- ---------------------------------------------------------------------------
-- Messaging: conversations + participants + messages.
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid (),
  created_at timestamptz default now() not null,
  last_message_at timestamptz,
  last_message_preview text,
  match_id uuid
);

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

-- ---------------------------------------------------------------------------
-- Mutual matches (messaging only after both accept; links to conversations.match_id)
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

alter table public.conversations
  drop constraint if exists conversations_match_id_fkey;

alter table public.conversations
  add constraint conversations_match_id_fkey foreign key (match_id) references public.matches (id) on delete cascade;

create unique index if not exists conversations_one_per_match on public.conversations (match_id)
where
  match_id is not null;

-- ---------------------------------------------------------------------------
-- Student prerequisite uploads (required keys enforced in app)
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

-- Doctor weekly schedule: profiles.availability_schedule (jsonb, { slots, items }).

-- ---------------------------------------------------------------------------
-- opportunities: shadowing listings created by doctors (students browse).
-- ---------------------------------------------------------------------------
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

-- Buckets: avatars (public), student-forms (authenticated uploads to own prefix).
-- RLS: see supabase/migrations/003_opportunities.sql

-- ---------------------------------------------------------------------------
-- Row Level Security (outline — enable and tailor per deployment)
-- ---------------------------------------------------------------------------
-- alter table public.profiles enable row level security;
-- alter table public.student_hours enable row level security;
-- alter table public.meeting_slots enable row level security;
-- alter table public.bookings enable row level security;
-- alter table public.conversations enable row level security;
-- alter table public.conversation_participants enable row level security;
-- alter table public.messages enable row level security;
--
-- Typical policies:
-- - profiles: SELECT for authenticated users (networking) or public read; UPDATE own row only.
-- - student_hours: SELECT/UPDATE where user_id = auth.uid().
-- - meeting_slots: SELECT all; INSERT/UPDATE where doctor_id = auth.uid().
-- - messages: SELECT/INSERT where user is a participant of the conversation.
-- - bookings: SELECT where student_id or doctor_id = auth.uid(); INSERT as student for open slots.
-- - matches: SELECT if student_id or doctor_id = auth.uid(); INSERT as student (request); UPDATE doctor_accepted_at as doctor.
-- - student_documents: SELECT/INSERT/UPDATE own student_id only.
-- - profiles.availability_schedule: updated with profile row (doctors).
