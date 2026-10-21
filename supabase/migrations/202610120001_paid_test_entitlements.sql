-- Paid test payment state, webhook idempotency, and free-unlock entitlements.
alter type public.payment_status add value if not exists 'pending';

alter table public.payments
  add column if not exists failure_code text,
  add column if not exists failure_reason text,
  add column if not exists refund_id text unique,
  add column if not exists paid_at timestamptz,
  add column if not exists refunded_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_code text not null,
  source text not null check (source in ('free_unlock', 'payment', 'admin')),
  source_id uuid,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_code, source)
);

create index if not exists entitlements_user_product_idx
  on public.entitlements (user_id, product_code, status);

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute procedure public.set_updated_at();

alter table public.entitlements enable row level security;
alter table public.payment_webhook_events enable row level security;

create policy "entitlements: read own" on public.entitlements
  for select using (auth.uid() = user_id);
