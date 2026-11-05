import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/utils/supabase/server';
import AdminNavigation from './AdminNavigation';

const navigation = [
  { href: '/admin', label: 'Overview', icon: 'layout' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/tests', label: 'Test Attempts', icon: 'clipboard' },
  { href: '/admin/bookings', label: 'Career Guidance', icon: 'calendar' },
  { href: '/admin/services', label: 'Service Fulfilment', icon: 'briefcase' },
  { href: '/admin/payments', label: 'Payments', icon: 'creditCard' },
  { href: '/admin/enquiries', label: 'Support', icon: 'inbox' },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  if (!await getAdminUser()) redirect('/dashboard');

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Talenezio admin overview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/talenezio-wordmark-light-mode.png" alt="Talenezio" className="h-8 w-auto object-contain" />
            <span className="text-sm font-semibold text-slate-500">Admin</span>
          </Link>
        </div>

        <AdminNavigation items={navigation} />

        <div className="border-t border-slate-200 p-4">
          <Link href="/dashboard" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:translate-x-0.5 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 active:translate-x-0">
            <LogOut className="h-[18px] w-[18px] text-slate-400 transition-colors group-hover:text-rose-600" />
            Exit Admin
          </Link>
        </div>
      </aside>

      <main className="main-content-transition mx-auto w-full max-w-[1600px] flex-1 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
