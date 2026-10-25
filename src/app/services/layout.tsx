import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { isLocalDemoSession } from '@/lib/auth/local-demo';

export default async function ServicesLayout({ children }: { children: React.ReactNode }) {
  if (await isLocalDemoSession()) {
    return children;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=%2Fservices');
  }

  return children;
}
