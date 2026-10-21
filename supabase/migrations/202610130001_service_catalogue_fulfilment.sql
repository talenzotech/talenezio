-- Service catalogue purchases, fulfilment, enquiries, and service certificates.
create type public.service_order_status as enum (
  'requested', 'pending_payment', 'paid', 'scheduled', 'in_progress', 'completed', 'cancelled', 'refunded'
);

alter table public.entitlements
  add column if not exists remaining_uses integer check (remaining_uses is null or remaining_uses >= 0);

create or replace function public.consume_test_attempt(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.entitlements
  set remaining_uses = remaining_uses - 1
  where user_id = p_user_id
    and product_code = 'pro-test:attempts'
    and source = 'payment'
    and status = 'active'
    and remaining_uses > 0;
  return found;
end;
$$;

create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_code text not null,
  product_code text not null,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR',
  status public.service_order_status not null default 'pending_payment',
  payment_id uuid references public.payments(id) on delete set null,
  scheduled_for timestamptz,
  meeting_url text,
  fulfilment_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_orders_user_status_idx
  on public.service_orders (user_id, status, created_at desc);

create table public.service_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_code text not null check (service_code in ('courses', 'internships')),
  interest text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certificates
  add column if not exists service_order_id uuid unique references public.service_orders(id) on delete set null;

create trigger service_orders_set_updated_at before update on public.service_orders
  for each row execute procedure public.set_updated_at();
create trigger service_enquiries_set_updated_at before update on public.service_enquiries
  for each row execute procedure public.set_updated_at();

alter table public.service_orders enable row level security;
alter table public.service_enquiries enable row level security;

create policy "service orders: read own" on public.service_orders
  for select using (auth.uid() = user_id);
create policy "service enquiries: read own" on public.service_enquiries
  for select using (auth.uid() = user_id);
create policy "service enquiries: create own" on public.service_enquiries
  for insert with check (auth.uid() = user_id);
