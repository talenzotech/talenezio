import { getCurrentUser } from '@/lib/auth/current-user';
import { redirect } from 'next/navigation';
import { isLocalDemoSession } from '@/lib/auth/local-demo';

export default async function ServicesLayout({ children }: { children: React.ReactNode }) {
  if (await isLocalDemoSession()) {
    return children;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=%2Fservices');
  }

  return children;
}
