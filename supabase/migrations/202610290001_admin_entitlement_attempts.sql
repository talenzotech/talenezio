-- Allow manually granted admin attempts to be consumed like paid and free-unlock attempts.
create or replace function public.consume_test_attempt(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.entitlements
  set remaining_uses = remaining_uses - 1
  where user_id = p_user_id
    and product_code = 'pro-test:attempts'
    and source in ('payment', 'free_unlock', 'admin')
    and status = 'active'
    and remaining_uses > 0
    and (expires_at is null or expires_at > now());
  return found;
end;
$$;
