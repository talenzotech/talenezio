import 'server-only';

import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from './current-user';

export async function getAdminUser(user?: User | null) {
  const currentUser = user ?? await getCurrentUser();

  if (!currentUser) return null;

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (error || !profile?.is_admin) return null;

  return currentUser;
}
