import { createAdminClient } from '@/lib/supabase/admin';
import { updateServiceOrder } from './actions';

const statuses = ['requested', 'paid', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const;

export const revalidate = 0;

export default async function AdminServicesPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin.from('service_orders').select('*, profiles:user_id(full_name)').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Fulfilment</h1>
        <p className="mt-1 text-gray-500">Manage paid and free-unlock service delivery, scheduling, and completion certificates.</p>
      </div>
      <div className="space-y-4">
        {(orders || []).map((order) => (
          <form key={order.id} action={updateServiceOrder} className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_180px_180px_1fr_auto] md:items-end">
            <div>
              <p className="font-bold capitalize text-gray-900 dark:text-white">{order.service_code.replaceAll('-', ' ')}</p>
              <p className="text-sm text-gray-500">{order.profiles?.full_name || 'Unknown user'} · ₹{order.amount_paise / 100}</p>
              <p className="mt-1 text-xs text-gray-400">{order.id}</p>
            </div>
            <input type="hidden" name="orderId" value={order.id} />
            <label className="text-xs font-semibold text-gray-500">Status<select name="status" defaultValue={order.status} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">Schedule<input name="scheduledFor" type="datetime-local" defaultValue={order.scheduled_for ? new Date(order.scheduled_for).toISOString().slice(0, 16) : ''} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
            <div className="space-y-2"><input name="meetingUrl" placeholder="Meeting or delivery URL" defaultValue={order.meeting_url || ''} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /><input name="note" placeholder="Fulfilment note" defaultValue={order.fulfilment_note || ''} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></div>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Save</button>
          </form>
        ))}
        {(!orders || orders.length === 0) && <p className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">No service orders yet.</p>}
      </div>
    </div>
  );
}
