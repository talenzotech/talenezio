-- One private resume draft per authenticated user.
create table public.resume_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  resume_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger resume_drafts_set_updated_at before update on public.resume_drafts
  for each row execute procedure public.set_updated_at();

alter table public.resume_drafts enable row level security;

create policy "resume drafts: read own" on public.resume_drafts
  for select using (auth.uid() = user_id);
create policy "resume drafts: create own" on public.resume_drafts
  for insert with check (auth.uid() = user_id);
create policy "resume drafts: update own" on public.resume_drafts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
