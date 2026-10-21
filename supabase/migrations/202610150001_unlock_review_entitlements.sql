-- Secure unlock submission history, review transitions, evidence ownership, and service access.
alter table public.unlock_submissions
  drop constraint if exists unlock_submissions_user_id_key;

create unique index if not exists unlock_submissions_one_open_per_user_idx
  on public.unlock_submissions (user_id)
  where status in ('pending', 'approved');

alter table public.unlock_evidence
  add column if not exists position integer;

create unique index if not exists unlock_evidence_submission_position_idx
  on public.unlock_evidence (submission_id, position)
  where position is not null;

create index if not exists unlock_submissions_user_created_idx
  on public.unlock_submissions (user_id, created_at desc);

-- Existing free-unlock approvals must not retain the removed unlimited Pro access.
update public.entitlements
set status = 'revoked', updated_at = now()
where product_code = 'pro-test:all'
  and source = 'free_unlock'
  and status = 'active';

create or replace function public.consume_test_attempt(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.entitlements
  set remaining_uses = remaining_uses - 1
  where user_id = p_user_id
    and product_code = 'pro-test:attempts'
    and source in ('payment', 'free_unlock')
    and status = 'active'
    and remaining_uses > 0
    and (expires_at is null or expires_at > now());
  return found;
end;
$$;

create or replace function public.review_unlock_submission(
  p_submission_id uuid,
  p_reviewer_id uuid,
  p_status public.review_status,
  p_note text default null
)
returns table (submission_id uuid, reviewed_user_id uuid, final_status public.review_status)
language plpgsql security definer set search_path = public as $$
declare
  submission_user_id uuid;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid review status';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_reviewer_id and is_admin = true
  ) then
    raise exception 'Reviewer is not an administrator';
  end if;

  select user_id into submission_user_id
  from public.unlock_submissions
  where id = p_submission_id and status = 'pending'
  for update;

  if submission_user_id is null then
    raise exception 'Submission is missing or is no longer pending';
  end if;

  update public.unlock_submissions
  set status = p_status,
      reviewer_id = p_reviewer_id,
      reviewer_note = nullif(left(coalesce(p_note, ''), 2000), ''),
      reviewed_at = now()
  where id = p_submission_id;

  if p_status = 'approved' then
    insert into public.entitlements (user_id, product_code, source, source_id, status, remaining_uses)
    values
      (submission_user_id, 'service:interview-prep', 'free_unlock', p_submission_id, 'active', null),
      (submission_user_id, 'service:linkedin-optimization', 'free_unlock', p_submission_id, 'active', null),
      (submission_user_id, 'service:career-starter-pack', 'free_unlock', p_submission_id, 'active', null),
      (submission_user_id, 'pro-test:attempts', 'free_unlock', p_submission_id, 'active', 10)
    on conflict (user_id, product_code, source)
    do update set source_id = excluded.source_id,
                  status = 'active',
                  remaining_uses = excluded.remaining_uses,
                  updated_at = now();
  else
    update public.entitlements
    set status = 'revoked', updated_at = now()
    where user_id = submission_user_id
      and source = 'free_unlock'
      and status = 'active'
      and product_code in (
        'service:interview-prep',
        'service:linkedin-optimization',
        'service:career-starter-pack',
        'pro-test:attempts'
      );
  end if;

  return query select p_submission_id, submission_user_id, p_status;
end;
$$;
