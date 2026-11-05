-- Grant the requested admin access without depending on a mutable profile id.
update public.profiles as profiles
set is_admin = true
from auth.users as users
where profiles.id = users.id
  and (
    lower(coalesce(users.email, '')) like '%neroni%'
    or lower(coalesce(users.raw_user_meta_data ->> 'username', '')) = 'neroni'
    or lower(coalesce(users.raw_user_meta_data ->> 'full_name', '')) like '%neroni%'
    or lower(coalesce(profiles.full_name, '')) like '%neroni%'
  );
