-- Existing auth profiles predate the referral-code trigger. Give every profile
-- the same deterministic code format used by handle_new_customer_user(), then
-- mirror it into referral_codes for the referral-link workflow.

update public.profiles
set
  referral_code = 'NX' || upper(substring(md5(id::text) from 1 for 8)),
  updated_at = now()
where nullif(btrim(referral_code), '') is null;

insert into public.referral_codes (
  customer_id,
  referral_code,
  referral_link,
  is_active
)
select
  id,
  referral_code,
  'https://meripahalfasthelp.online/ref/' || referral_code,
  true
from public.profiles
where nullif(btrim(referral_code), '') is not null
on conflict (customer_id) do update
set
  referral_code = excluded.referral_code,
  referral_link = excluded.referral_link,
  is_active = true;

do $verification$
begin
  if exists (
    select 1
    from public.profiles
    where nullif(btrim(referral_code), '') is null
  ) then
    raise exception 'Referral-code backfill left profiles without a code';
  end if;

  if exists (
    select 1
    from public.profiles p
    left join public.referral_codes rc
      on rc.customer_id = p.id
     and rc.referral_code = p.referral_code
    where rc.customer_id is null
  ) then
    raise exception 'Referral-code mirror verification failed';
  end if;
end
$verification$;
