-- Optional / legacy profile columns (aliases and extra fields).
-- Safe with IF NOT EXISTS: skips when a column name already exists (e.g. areas_of_focus as text[] from base schema).
-- App reads these via normalizeProfileRowForForm (profileFormNormalize.ts).

-- identity / basic profile
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists specialty text;

-- organization / workplace
alter table public.profiles add column if not exists organization text;
alter table public.profiles add column if not exists hospital text;
alter table public.profiles add column if not exists organization_name text;
alter table public.profiles add column if not exists hospital_name text;

-- photo
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists photo_url text;

-- shadowing / availability
alter table public.profiles add column if not exists open_to_shadowing boolean default false;
alter table public.profiles add column if not exists shadowing_available boolean default false;
alter table public.profiles add column if not exists availability_status text;
alter table public.profiles add column if not exists availability jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists week_availability jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists availability_schedule jsonb default '{}'::jsonb;

-- location (alongside canonical `location` text from base schema)
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists neighborhood text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists lat double precision;
alter table public.profiles add column if not exists lng double precision;

-- student logistics / preparation
alter table public.profiles add column if not exists dress_preferences text;
alter table public.profiles add column if not exists dress_code_preferences text;
alter table public.profiles add column if not exists meeting_point_preferences text;
alter table public.profiles add column if not exists check_in_instructions text;
alter table public.profiles add column if not exists check_in_details text;
alter table public.profiles add column if not exists pre_shadowing_readings text;
alter table public.profiles add column if not exists pre_shadowing_readings_and_papers text;

-- focus / topics (may be text or text[] depending on existing DB; app coerces either)
alter table public.profiles add column if not exists areas_of_focus text;
alter table public.profiles add column if not exists focus_areas text;
alter table public.profiles add column if not exists mentoring_topics text;
alter table public.profiles add column if not exists doctor_interests text;
alter table public.profiles add column if not exists interests text;
alter table public.profiles add column if not exists tags text;
alter table public.profiles add column if not exists skills text;

-- misc
alter table public.profiles add column if not exists updated_at timestamp with time zone default now();
