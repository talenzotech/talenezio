-- Server-authoritative test attempts and private certificate files.
create type public.test_attempt_status as enum ('in_progress', 'submitted', 'expired');

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  test_type text not null check (test_type in ('free', 'pro')),
  question_snapshot jsonb not null,
  answers jsonb,
  score integer check (score is null or score >= 0),
  total_questions integer not null check (total_questions > 0),
  status public.test_attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz
);

create index test_attempts_user_created_idx on public.test_attempts (user_id, started_at desc);

alter table public.certificates
  add column if not exists attempt_id uuid unique references public.test_attempts(id) on delete set null,
  add column if not exists candidate_name text;

alter table public.test_attempts enable row level security;

create policy "test attempts: read own" on public.test_attempts
  for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do update set public = false;

create policy "certificates: read own files" on storage.objects
  for select using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
