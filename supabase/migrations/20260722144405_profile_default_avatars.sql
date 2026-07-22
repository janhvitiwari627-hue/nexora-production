-- Keep customer profile photos non-empty in the UI without storing generated
-- portraits as if they were user-uploaded files. The effective automatic
-- avatar is selected by default_avatar_key; avatar_url remains reserved for a
-- real photo chosen by the customer.

alter table public.profiles
  add column if not exists avatar_mode text not null default 'automatic',
  add column if not exists default_avatar_key text not null default 'neutral';

do $constraints$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_avatar_mode_check'
  ) then
    alter table public.profiles
      add constraint profiles_avatar_mode_check
      check (avatar_mode in ('automatic', 'custom')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_default_avatar_key_check'
  ) then
    alter table public.profiles
      add constraint profiles_default_avatar_key_check
      check (default_avatar_key in ('male', 'female', 'neutral')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_avatar_mode_matches_url_check'
  ) then
    alter table public.profiles
      add constraint profiles_avatar_mode_matches_url_check
      check (
        (avatar_mode = 'automatic' and avatar_url is null)
        or (avatar_mode = 'custom' and nullif(btrim(avatar_url), '') is not null)
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_default_avatar_matches_gender_check'
  ) then
    alter table public.profiles
      add constraint profiles_default_avatar_matches_gender_check
      check (
        (gender = 'male' and default_avatar_key = 'male')
        or (gender = 'female' and default_avatar_key = 'female')
        or (gender is null and default_avatar_key = 'neutral')
      ) not valid;
  end if;
end
$constraints$;

create or replace function public.sync_profile_avatar_defaults()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.default_avatar_key := case lower(coalesce(new.gender, ''))
    when 'male' then 'male'
    when 'female' then 'female'
    else 'neutral'
  end;

  if nullif(btrim(new.avatar_url), '') is null then
    new.avatar_url := null;
    new.avatar_mode := 'automatic';
  else
    new.avatar_mode := 'custom';
  end if;

  return new;
end;
$function$;

drop trigger if exists profiles_sync_avatar_defaults on public.profiles;
create trigger profiles_sync_avatar_defaults
before insert or update of avatar_url, gender
on public.profiles
for each row
execute function public.sync_profile_avatar_defaults();

update public.profiles
set
  avatar_url = nullif(btrim(avatar_url), ''),
  avatar_mode = case
    when nullif(btrim(avatar_url), '') is null then 'automatic'
    else 'custom'
  end,
  default_avatar_key = case lower(coalesce(gender, ''))
    when 'male' then 'male'
    when 'female' then 'female'
    else 'neutral'
  end;

alter table public.profiles validate constraint profiles_avatar_mode_check;
alter table public.profiles validate constraint profiles_default_avatar_key_check;
alter table public.profiles validate constraint profiles_avatar_mode_matches_url_check;
alter table public.profiles validate constraint profiles_default_avatar_matches_gender_check;

-- Trigger-only helpers are not browser RPC endpoints.
revoke all on function public.sync_profile_avatar_defaults() from public, anon, authenticated;
