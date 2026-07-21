-- Align the live customer-auth profile with the fields consumed by the main app.
-- This migration is additive and preserves all existing users and profile data.

alter table public.profiles
  add column if not exists block text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists district text,
  add column if not exists gender text,
  add column if not exists is_active boolean not null default true,
  add column if not exists is_verified boolean not null default false,
  add column if not exists latitude double precision,
  add column if not exists location_captured_at timestamptz,
  add column if not exists longitude double precision,
  add column if not exists nexora_id text,
  add column if not exists pincode text,
  add column if not exists referral_code text,
  add column if not exists referred_by text,
  add column if not exists referred_by_user_id uuid,
  add column if not exists state text,
  add column if not exists username text;

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_gender_check'
  ) then
    alter table public.profiles
      add constraint profiles_gender_check
      check (gender is null or gender in ('male', 'female')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_referred_by_user_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_referred_by_user_id_fkey
      foreign key (referred_by_user_id) references public.profiles(id)
      on delete set null not valid;
  end if;
end
$migration$;

update public.profiles as p
set
  mobile = coalesce(p.mobile, nullif(btrim(u.raw_user_meta_data ->> 'mobile'), '')),
  gender = coalesce(
    p.gender,
    case
      when lower(nullif(btrim(u.raw_user_meta_data ->> 'gender'), '')) in ('male', 'female')
        then lower(nullif(btrim(u.raw_user_meta_data ->> 'gender'), ''))
      when lower(p.gender_preference) in ('male', 'female') then lower(p.gender_preference)
    end
  ),
  city = coalesce(p.city, p.preferred_city),
  block = coalesce(p.block, p.preferred_area),
  country = coalesce(p.country, 'India'),
  nexora_id = coalesce(p.nexora_id, 'NX' || upper(substring(md5(p.id::text) from 1 for 10))),
  referral_code = coalesce(p.referral_code, rc.referral_code),
  updated_at = now()
from auth.users as u
left join public.referral_codes as rc on rc.customer_id = u.id
where p.id = u.id;

update public.referral_codes
set referral_link = 'https://meripahalfasthelp.online/ref/' || referral_code
where referral_link is distinct from 'https://meripahalfasthelp.online/ref/' || referral_code;

alter table public.profiles validate constraint profiles_gender_check;
alter table public.profiles validate constraint profiles_referred_by_user_id_fkey;

create unique index if not exists profiles_nexora_id_uidx
  on public.profiles (nexora_id) where nexora_id is not null;
create unique index if not exists profiles_referral_code_upper_uidx
  on public.profiles (upper(referral_code)) where referral_code is not null;
create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username)) where username is not null;
create index if not exists profiles_referred_by_user_id_idx
  on public.profiles (referred_by_user_id) where referred_by_user_id is not null;

create or replace function public.handle_new_customer_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  ref_code text;
  gender_value text;
begin
  ref_code := 'NX' || upper(substring(md5(new.id::text) from 1 for 8));
  gender_value := lower(nullif(btrim(new.raw_user_meta_data ->> 'gender'), ''));
  if gender_value not in ('male', 'female') then
    gender_value := null;
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    mobile,
    gender,
    gender_preference,
    country,
    is_active,
    is_verified,
    nexora_id,
    referral_code
  )
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
    ),
    new.email,
    nullif(btrim(new.raw_user_meta_data ->> 'mobile'), ''),
    gender_value,
    gender_value,
    'India',
    true,
    false,
    'NX' || upper(substring(md5(new.id::text) from 1 for 10)),
    ref_code
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      mobile = coalesce(public.profiles.mobile, excluded.mobile),
      gender = coalesce(public.profiles.gender, excluded.gender),
      gender_preference = coalesce(public.profiles.gender_preference, excluded.gender_preference),
      country = coalesce(public.profiles.country, excluded.country),
      nexora_id = coalesce(public.profiles.nexora_id, excluded.nexora_id),
      referral_code = coalesce(public.profiles.referral_code, excluded.referral_code),
      updated_at = now();

  -- A public signup always starts with customer privileges. Higher-trust roles
  -- are assigned only by approved server-side/admin flows, never user metadata.
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  insert into public.reward_wallets (customer_id)
  values (new.id)
  on conflict (customer_id) do nothing;

  insert into public.referral_codes
    (customer_id, referral_code, referral_link)
  values
    (new.id, ref_code, 'https://meripahalfasthelp.online/ref/' || ref_code)
  on conflict (customer_id) do update
  set referral_code = excluded.referral_code,
      referral_link = excluded.referral_link,
      is_active = true;

  return new;
end;
$function$;

revoke all on function public.handle_new_customer_user() from public, anon, authenticated;
grant execute on function public.handle_new_customer_user() to supabase_auth_admin;

-- Trigger-only helpers are not browser RPC endpoints.
alter function public.handle_referral_signup() set search_path = '';
alter function public.ensure_reward_wallet_for_user(uuid) set search_path = '';
alter function public.generate_referral_code_for_user(uuid) set search_path = '';
revoke all on function public.handle_referral_signup() from public, anon, authenticated;
revoke all on function public.ensure_reward_wallet_for_user(uuid) from public, anon, authenticated;
revoke all on function public.generate_referral_code_for_user(uuid) from public, anon, authenticated;

-- Pin lookup order for non-definer helpers flagged by the security advisor.
alter function public.generate_booking_reference(text, date)
  set search_path = pg_catalog, public;
alter function public.check_slot_availability(uuid, uuid, date, time, time, uuid)
  set search_path = pg_catalog, public;
alter function public.validate_membership_benefit(uuid, date)
  set search_path = pg_catalog, public;

-- Remove browser access from trigger-only functions and anonymous access from
-- ownership helpers. Authenticated access stays for RLS evaluation.
alter function public.log_booking_status_change() set search_path = '';
revoke all on function public.log_booking_status_change() from public, anon, authenticated;
revoke execute on function public.can_manage_shop(uuid) from public, anon;
revoke execute on function public.is_shop_member(uuid) from public, anon;
revoke execute on function public.is_shop_owner(uuid) from public, anon;

-- Referral attribution is created by the trusted signup trigger. An unrestricted
-- anonymous INSERT policy allowed arbitrary referral spam.
drop policy if exists "Public can insert referral click" on public.referrals;
revoke insert on table public.referrals from public, anon;

-- Public buckets serve object URLs without a bucket-wide SELECT policy. Dropping
-- this policy prevents anonymous listing of every salon asset.
drop policy if exists "Public Access to salon-assets" on storage.objects;

-- Add missing covering indexes for foreign keys without removing existing ones.
do $indexes$
declare
  fk record;
  generated_name text;
begin
  for fk in
    select
      n.nspname as schema_name,
      t.relname as table_name,
      c.conname,
      c.conrelid,
      c.conkey,
      string_agg(quote_ident(a.attname), ', ' order by u.ord) as columns_sql
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    cross join lateral unnest(c.conkey) with ordinality as u(attnum, ord)
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = u.attnum
    where c.contype = 'f'
      and n.nspname = 'public'
      and not exists (
        select 1
        from pg_index i
        where i.indrelid = c.conrelid
          and i.indisvalid
          and c.conkey <@ (i.indkey::smallint[])
      )
    group by n.nspname, t.relname, c.conname, c.conrelid, c.conkey
  loop
    generated_name := left('idx_' || fk.table_name || '_' || fk.conname, 63);
    execute format(
      'create index if not exists %I on %I.%I (%s)',
      generated_name,
      fk.schema_name,
      fk.table_name,
      fk.columns_sql
    );
  end loop;
end
$indexes$;
