-- Use a single `location` text column on profiles (replaces city / state / neighborhood).
-- Safe if you already only have `location`, or if you still have the old columns.

alter table public.profiles add column if not exists location text default '' not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where
      table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'city'
  ) then
    execute $mig$
      update public.profiles
      set
        location = trim(
          both ' '
          from
            concat_ws(
              ', ',
              nullif(trim(neighborhood), ''),
              nullif(trim(city), ''),
              nullif(trim(state), '')
            )
        )
      where
        location is null
        or location = '';
    $mig$;
    alter table public.profiles drop column if exists neighborhood;
    alter table public.profiles drop column if exists city;
    alter table public.profiles drop column if exists state;
  end if;
end $$;
