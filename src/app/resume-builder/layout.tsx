import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=%2Fresume-builder');

  return children;
}
