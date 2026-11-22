-- Ensure service_order_status enum exists idempotently
do $$ begin
  create type public.service_order_status as enum (
    'requested', 'pending_payment', 'paid', 'scheduled', 'in_progress', 'completed', 'cancelled', 'refunded'
  );
exception
  when duplicate_object then null;
end $$;

-- Ensure service_orders table exists
create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_code text not null,
  product_code text not null,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR',
  status public.service_order_status not null default 'pending_payment',
  payment_id uuid unique references public.payments(id) on delete set null,
  scheduled_for timestamptz,
  meeting_url text,
  fulfilment_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure indexes and RLS policies
create index if not exists service_orders_user_status_idx
  on public.service_orders (user_id, status, created_at desc);

alter table public.service_orders enable row level security;

do $$ begin
  create policy "service orders: read own" on public.service_orders
    for select using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;
