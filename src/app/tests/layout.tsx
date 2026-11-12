import { getCurrentUser } from '@/lib/auth/current-user';
import { redirect } from 'next/navigation';
import { isLocalDemoSession } from '@/lib/auth/local-demo';

export default async function TestsLayout({ children }: { children: React.ReactNode }) {
  if (await isLocalDemoSession()) {
    return children;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=%2Ftests');
  }

  return children;
}
