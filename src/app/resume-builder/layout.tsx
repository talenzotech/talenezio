import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { isLocalDemoSession } from '@/lib/auth/local-demo';

export default async function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'development' || (await isLocalDemoSession())) {
    return children;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=%2Fresume-builder');

  return children;
}
