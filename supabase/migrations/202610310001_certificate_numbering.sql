-- Keep every attempt linked when identical results share one updated certificate.
alter table public.test_attempts
  add column certificate_id uuid references public.certificates(id) on delete set null;

update public.test_attempts a set certificate_id = c.id
from public.certificates c where c.attempt_id = a.id;

alter table public.certificates
  add column number_base text,
  add column number_suffix integer check (number_suffix >= 1);

create unique index certificates_base_suffix_idx on public.certificates (number_base, number_suffix);
create unique index certificates_user_base_idx on public.certificates (user_id, number_base);

-- Called only by the trusted server after authenticating and validating ownership.
-- Lock allocation per base so matching initials cannot race for the same suffix.
create function public.allocate_test_certificate(
  p_attempt_id uuid, p_user_id uuid, p_name text, p_base text, p_issued_at timestamptz
) returns setof public.certificates
language plpgsql security definer set search_path = '' as $$
declare
  v_attempt public.test_attempts%rowtype;
  v_certificate public.certificates%rowtype;
  v_suffix integer;
begin
  select * into v_attempt from public.test_attempts
    where id = p_attempt_id and user_id = p_user_id for update;
  if not found or v_attempt.status <> 'submitted' or v_attempt.score is null then
    raise exception 'Completed test not found';
  end if;

  -- Retries and old attempt links keep their original number and issue date.
  if v_attempt.certificate_id is not null then
    return query select * from public.certificates where id = v_attempt.certificate_id;
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_base, 0));
  select * into v_certificate from public.certificates
    where user_id = p_user_id and number_base = p_base for update;

  if found then
    -- Same user's identical result: refresh the existing PDF, retaining its number.
    update public.certificates set candidate_name = p_name, attempt_id = p_attempt_id,
      issued_at = p_issued_at, pdf_path = null,
      score = round(v_attempt.score::numeric / v_attempt.total_questions * 100, 2)
      where id = v_certificate.id returning * into v_certificate;
  else
    select coalesce(max(number_suffix), 0) + 1 into v_suffix
      from public.certificates where number_base = p_base;
    insert into public.certificates (
      user_id, attempt_id, candidate_name, certificate_number, number_base, number_suffix,
      certificate_type, topic, score, issued_at
    ) values (
      p_user_id, p_attempt_id, p_name,
      p_base || case when v_suffix = 1 then '' else v_suffix::text end,
      p_base, v_suffix, 'test_completion', v_attempt.category,
      round(v_attempt.score::numeric / v_attempt.total_questions * 100, 2), p_issued_at
    ) returning * into v_certificate;
  end if;

  update public.test_attempts set certificate_id = v_certificate.id where id = p_attempt_id;
  return next v_certificate;
end;
$$;

revoke all on function public.allocate_test_certificate(uuid, uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.allocate_test_certificate(uuid, uuid, text, text, timestamptz) to service_role;
