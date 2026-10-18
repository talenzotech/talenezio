-- Talenezio Day 1 schema. Auth identities are owned by Supabase Auth.
create extension if not exists "pgcrypto";

create type public.payment_status as enum ('created', 'paid', 'failed', 'refunded');
create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_code text not null,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR',
  provider text not null default 'razorpay',
  provider_order_id text unique,
  provider_payment_id text unique,
  status public.payment_status not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  certificate_number text not null unique,
  certificate_type text not null,
  topic text not null,
  performance_statement text,
  score numeric(5,2),
  issued_at timestamptz not null default now(),
  pdf_path text
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_code text not null,
  domain text,
  scheduled_for timestamptz,
  meeting_url text,
  status public.booking_status not null default 'pending',
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.unlock_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  status public.review_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.unlock_evidence (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.unlock_submissions(id) on delete cascade,
  evidence_type text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute procedure public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute procedure public.set_updated_at();
create trigger unlock_submissions_set_updated_at before update on public.unlock_submissions for each row execute procedure public.set_updated_at();

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.certificates enable row level security;
alter table public.bookings enable row level security;
alter table public.unlock_submissions enable row level security;
alter table public.unlock_evidence enable row level security;

create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "payments: read own" on public.payments for select using (auth.uid() = user_id);
create policy "certificates: read own" on public.certificates for select using (auth.uid() = user_id);
create policy "bookings: read own" on public.bookings for select using (auth.uid() = user_id);
create policy "submissions: read own" on public.unlock_submissions for select using (auth.uid() = user_id);
create policy "evidence: read own" on public.unlock_evidence for select using (exists (select 1 from public.unlock_submissions where id = submission_id and user_id = auth.uid()));
