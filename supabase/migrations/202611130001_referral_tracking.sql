-- Persist referral ownership and attribution independently of Auth metadata.
alter table public.profiles
  add column if not exists referral_code text;

create or replace function public.generate_referral_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := 'TZ-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 6));
    exit when not exists (select 1 from public.profiles where referral_code = candidate);
  end loop;
  return candidate;
end;
$$;

do $$
declare
  profile_row record;
begin
  for profile_row in select id from public.profiles where referral_code is null loop
    update public.profiles
    set referral_code = public.generate_referral_code()
    where id = profile_row.id;
  end loop;
end;
$$;

alter table public.profiles
  alter column referral_code set not null;

create unique index if not exists profiles_referral_code_key
  on public.profiles (referral_code);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null unique references public.profiles(id) on delete cascade,
  code_submitted text not null,
  status text not null default 'registered'
    check (status in ('registered', 'verified', 'converted')),
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  converted_at timestamptz,
  conversion_payment_id uuid references public.payments(id) on delete set null
);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_id, created_at desc);
create index if not exists referrals_status_idx
  on public.referrals (status, created_at desc);

alter table public.referrals enable row level security;

create policy "referrals: read own relationships" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_user_id);

create or replace function public.set_profile_referral_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.referral_code is null or btrim(new.referral_code) = '' then
    new.referral_code := public.generate_referral_code();
  else
    new.referral_code := upper(btrim(new.referral_code));
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_set_referral_code on public.profiles;
create trigger profiles_set_referral_code
before insert on public.profiles
for each row execute procedure public.set_profile_referral_code();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  submitted_code text := upper(nullif(btrim(new.raw_user_meta_data ->> 'referral_code'), ''));
  referrer uuid;
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');

  if submitted_code is not null then
    select id into referrer
    from public.profiles
    where referral_code = submitted_code
      and id <> new.id;

    if referrer is not null then
      insert into public.referrals (referrer_id, referred_user_id, code_submitted)
      values (referrer, new.id, submitted_code)
      on conflict (referred_user_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.mark_referral_verified(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.referrals
  set status = 'verified', verified_at = coalesce(verified_at, now())
  where referred_user_id = p_user_id and status = 'registered';
$$;

revoke execute on function public.mark_referral_verified(uuid) from public, anon, authenticated;
grant execute on function public.mark_referral_verified(uuid) to service_role;

create or replace function public.mark_referral_converted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.status is distinct from 'paid')) then
    update public.referrals
    set status = 'converted',
        converted_at = coalesce(converted_at, coalesce(new.paid_at, now())),
        conversion_payment_id = coalesce(conversion_payment_id, new.id)
    where referred_user_id = new.user_id
      and status <> 'converted';
  end if;
  return new;
end;
$$;

drop trigger if exists payments_mark_referral_converted on public.payments;
create trigger payments_mark_referral_converted
after insert or update of status, paid_at on public.payments
for each row execute procedure public.mark_referral_converted();
