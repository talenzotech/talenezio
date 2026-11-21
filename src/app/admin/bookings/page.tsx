import Link from 'next/link';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import BookingsClient from './BookingsClient';

export const revalidate = 0; // Disable caching

export default async function AdminBookingsPage() {
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bookings } = await adminClient
    .from('bookings')
    .select(`
      *,
      profiles:user_id (full_name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Scheduling</h2>
          <p className="text-gray-500 mt-1">Manage 1-on-1 career counseling and interview prep sessions.</p>
        </div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          View Submitted Applications & Resumes →
        </Link>
      </div>
      
      <BookingsClient bookings={bookings || []} />
    </div>
  );
}
