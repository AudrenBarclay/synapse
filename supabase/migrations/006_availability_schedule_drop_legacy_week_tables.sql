-- Weekly doctor schedule lives in profiles.availability_schedule (jsonb). Legacy tables removed.

alter table public.profiles
  add column if not exists availability_schedule jsonb default '{}'::jsonb;

drop table if exists public.doctor_schedule_items cascade;
drop table if exists public.doctor_week_half_slots cascade;
