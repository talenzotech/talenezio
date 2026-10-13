import { createAdminClient } from '@/lib/supabase/admin';
import { updateEnquiry } from './actions';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const admin = createAdminClient();
  const { data: enquiries } = await admin.from('service_enquiries').select('*, profiles:user_id(full_name)').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course & Internship Enquiries</h1><p className="mt-1 text-gray-500">Review catalogue enquiries and track follow-up.</p></div>
      <div className="space-y-4">
        {(enquiries || []).map((enquiry) => (
          <form key={enquiry.id} action={updateEnquiry} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <input type="hidden" name="id" value={enquiry.id} />
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div><p className="font-bold capitalize text-gray-900 dark:text-white">{enquiry.service_code}</p><p className="text-sm text-gray-500">{enquiry.profiles?.full_name || 'Unknown user'} · {enquiry.interest}</p>{enquiry.message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{enquiry.message}</p>}</div>
              <div className="flex gap-2"><select name="status" defaultValue={enquiry.status} className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"><option value="new">new</option><option value="contacted">contacted</option><option value="closed">closed</option></select><input name="note" defaultValue={enquiry.admin_note || ''} placeholder="Admin note" className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /><button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">Save</button></div>
            </div>
          </form>
        ))}
        {(!enquiries || enquiries.length === 0) && <p className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">No enquiries yet.</p>}
      </div>
    </div>
  );
}
