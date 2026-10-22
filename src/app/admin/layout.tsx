import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Unlock, CalendarDays, LogOut, BriefcaseBusiness, Inbox } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Bypass RLS to check admin status
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error || !profile?.is_admin) {
    console.log('🔴 Admin Check Failed for User:', user.id);
    console.log('Error details:', error);
    console.log('Profile data:', profile);
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col md:min-h-screen md:sticky md:top-0 md:z-10">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-800">
          <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            Admin Portal
          </Link>
        </div>
        
        <nav className="flex flex-wrap gap-1 p-3 sm:p-4 md:flex md:flex-1 md:flex-col md:space-y-2 md:overflow-y-auto">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm">
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            Overview
          </Link>
          <Link href="/admin/unlock-submissions" className="flex min-w-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm">
            <Unlock className="w-5 h-5 text-gray-500" />
            Unlock Approvals
          </Link>
          <Link href="/admin/bookings" className="flex min-w-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            Session Scheduling
          </Link>
          <Link href="/admin/services" className="flex min-w-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm">
            <BriefcaseBusiness className="w-5 h-5 text-gray-500" />
            Service Fulfilment
          </Link>
          <Link href="/admin/enquiries" className="flex min-w-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm">
            <Inbox className="w-5 h-5 text-gray-500" />
            Enquiries
          </Link>
        </nav>
        
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-zinc-800 md:mt-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm">
            <LogOut className="w-5 h-5 text-gray-500" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-full">
        {children}
      </main>
    </div>
  );
}
