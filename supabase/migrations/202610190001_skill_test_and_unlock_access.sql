alter table public.unlock_submissions
  drop constraint if exists unlock_submissions_user_id_key;

alter table public.unlock_submissions
  add column if not exists feature_code text not null default 'general_access',
  add column if not exists contact_email text,
  add column if not exists whatsapp_phone text;

update public.unlock_submissions
set feature_code = 'skill_test_pro'
where status = 'approved' and feature_code = 'general_access';

alter table public.unlock_submissions
  add constraint unlock_submissions_feature_code_check
  check (feature_code in ('general_access', 'skill_test_pro', 'linkedin_optimization'));

create unique index if not exists unlock_submissions_active_feature_unique
  on public.unlock_submissions (user_id, feature_code)
  where status in ('pending', 'approved');

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select profile.is_admin
    from public.profiles as profile
    where profile.id = auth.uid()
  ), false);
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

create policy "submissions: insert own pending"
  on public.unlock_submissions for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and reviewer_id is null
    and reviewed_at is null
  );

create policy "submissions: admins read all"
  on public.unlock_submissions for select to authenticated
  using (public.is_current_user_admin());

create policy "profiles: admins read"
  on public.profiles for select to authenticated
  using (public.is_current_user_admin());

create policy "submissions: admins update"
  on public.unlock_submissions for update to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

create policy "evidence: insert own pending"
  on public.unlock_evidence for insert to authenticated
  with check (
    exists (
      select 1 from public.unlock_submissions
      where id = submission_id
        and user_id = auth.uid()
        and status = 'pending'
    )
  );

create policy "evidence: admins read all"
  on public.unlock_evidence for select to authenticated
  using (public.is_current_user_admin());

create or replace function public.submit_unlock_request(
  p_feature_code text,
  p_contact_email text,
  p_whatsapp_phone text,
  p_storage_paths text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_user_id uuid := auth.uid();
  new_submission_id uuid;
begin
  if request_user_id is null then
    raise exception 'You must be logged in to submit.';
  end if;

  if p_feature_code not in ('skill_test_pro', 'linkedin_optimization') then
    raise exception 'Select an eligible feature.';
  end if;

  if p_contact_email is null
    or p_contact_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or p_whatsapp_phone is null
    or length(regexp_replace(p_whatsapp_phone, '[^0-9]', '', 'g')) < 8
    or length(regexp_replace(p_whatsapp_phone, '[^0-9]', '', 'g')) > 15 then
    raise exception 'Enter a valid email address and WhatsApp phone number.';
  end if;

  if cardinality(p_storage_paths) <> 8
    or (select count(distinct path) from unnest(p_storage_paths) as path) <> 8
    or exists (
      select 1
      from unnest(p_storage_paths) as path
      where split_part(path, '/', 1) <> request_user_id::text
        or split_part(path, '/', 2) = ''
        or array_length(string_to_array(path, '/'), 1) <> 2
        or not exists (
          select 1
          from storage.objects as stored_object
          where stored_object.bucket_id = 'unlock_evidence'
            and stored_object.name = path
            and stored_object.metadata ->> 'mimetype' in ('image/jpeg', 'image/png', 'image/webp')
            and case
              when stored_object.metadata ->> 'size' ~ '^[0-9]+$'
                then (stored_object.metadata ->> 'size')::bigint <= 5242880
              else false
            end
        )
    ) then
    raise exception 'Upload exactly 8 unique supported image screenshots, no larger than 5MB each.';
  end if;

  insert into public.unlock_submissions (
    user_id, status, feature_code, contact_email, whatsapp_phone
  )
  values (
    request_user_id, 'pending', p_feature_code, lower(trim(p_contact_email)), trim(p_whatsapp_phone)
  )
  returning id into new_submission_id;

  insert into public.unlock_evidence (submission_id, evidence_type, storage_path)
  select
    new_submission_id,
    case
      when p_feature_code <> 'linkedin_optimization' then 'screenshot'
      when evidence.ordinality = 1 then 'linkedin_post'
      when evidence.ordinality between 2 and 6 then 'friend_share'
      else 'group_share'
    end,
    evidence.path
  from unnest(p_storage_paths) with ordinality as evidence(path, ordinality);

  return new_submission_id;
end;
$$;

revoke all on function public.submit_unlock_request(text, text, text, text[]) from public;
grant execute on function public.submit_unlock_request(text, text, text, text[]) to authenticated;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'unlock_evidence';
