alter table public.unlock_submissions
  add column if not exists feature_code text not null default 'linkedin_optimization',
  add column if not exists contact_email text,
  add column if not exists whatsapp_phone text;

alter table public.unlock_submissions
  drop constraint if exists unlock_submissions_feature_code_check;

alter table public.unlock_submissions
  add constraint unlock_submissions_feature_code_check
  check (feature_code in ('skill_test_pro', 'linkedin_optimization', 'general_access'));
