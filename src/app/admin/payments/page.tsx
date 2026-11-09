import { createAdminClient } from '@/lib/supabase/admin';
import { CreditCard } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();
  const { data: payments } = await admin.from('payments').select('id, product_code, amount_paise, currency, status, provider, created_at, profiles:user_id(full_name)').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">Payments</h1><p className="mt-1 text-sm text-gray-500">Review payment activity and transaction status.</p></header>
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Product</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{(payments || []).map((payment) => { const profile = Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles; return <tr key={payment.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-semibold text-gray-900">{profile?.full_name || 'Unknown user'}</td><td className="px-6 py-4 capitalize text-gray-600">{payment.product_code.replaceAll('-', ' ')}</td><td className="px-6 py-4 font-semibold text-gray-900">{payment.currency} {(payment.amount_paise / 100).toLocaleString('en-IN')}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{payment.status}</span></td><td className="px-6 py-4 text-gray-500">{new Date(payment.created_at).toLocaleString()}</td></tr>})}</tbody></table></div>{(!payments || payments.length === 0) && <div className="p-12 text-center text-sm text-gray-500"><CreditCard className="mx-auto mb-2 h-6 w-6" />No payments found.</div>}</div>
    </div>
  );
}
