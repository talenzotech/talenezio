import { createAdminClient } from '@/lib/supabase/admin';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  Clock3,
  CreditCard,
  FileText,
  Info,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import AdminDashboardControls, { type AnalyticsPoint } from './AdminDashboardControls';

export const revalidate = 0;

type QueueItem = {
  name: string;
  detail: string;
  type: string;
  status: string;
  submitted: string;
  href: string;
  initials: string;
  tone: string;
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
}

function relativeTime(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return `${minutes || 1} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function profileName(value: unknown) {
  const profile = Array.isArray(value) ? value[0] : value;
  if (!profile || typeof profile !== 'object' || !('full_name' in profile)) return 'Unknown user';
  const name = profile.full_name;
  return typeof name === 'string' && name ? name : 'Unknown user';
}

function buildAnalytics(points: { created_at: string }[], now: Date) {
  const daily: AnalyticsPoint[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return { label: date.toLocaleDateString('en-IN', { weekday: 'short' }), value: points.filter((point) => point.created_at.slice(0, 10) === key).length };
  });
  const monthly: AnalyticsPoint[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { label: date.toLocaleDateString('en-IN', { month: 'short' }), value: points.filter((point) => { const created = new Date(point.created_at); return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth(); }).length };
  });
  return { daily, monthly };
}

export default async function AdminOverviewPage() {
  const admin = createAdminClient();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const since = new Date(now);
  since.setDate(since.getDate() - 30);

  const [users, activeToday, paidPayments, attempts, pendingSubmissions, pendingBookings, newEnquiries, recentUsers, recentPayments, recentAttempts, analyticsUsers] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', dayAgo.toISOString()),
    admin.from('payments').select('amount_paise').eq('status', 'paid').gte('paid_at', since.toISOString()),
    admin.from('test_attempts').select('*', { count: 'exact', head: true }),
    admin.from('unlock_submissions').select('id, created_at, profiles:user_id(full_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    admin.from('bookings').select('id, created_at, service_code, profiles:user_id(full_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    admin.from('service_enquiries').select('id, created_at, interest, profiles:user_id(full_name)').eq('status', 'new').order('created_at', { ascending: false }).limit(5),
    admin.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(4),
    admin.from('payments').select('id, amount_paise, created_at, status, profiles:user_id(full_name)').order('created_at', { ascending: false }).limit(4),
    admin.from('test_attempts').select('id, category, started_at, profiles:user_id(full_name)').order('started_at', { ascending: false }).limit(4),
    admin.from('profiles').select('created_at').gte('created_at', new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()),
  ]);

  const revenue = (paidPayments.data || []).reduce((sum, payment) => sum + (payment.amount_paise || 0), 0);
  const analytics = buildAnalytics(analyticsUsers.data || [], now);

const queue: QueueItem[] = [
    ...(pendingSubmissions.data || []).map((item) => {
      const name = profileName(item.profiles);
      return { name, detail: 'Free Unlock Review', type: 'Service', status: 'Pending Approval', submitted: relativeTime(item.created_at), href: '/admin/unlock-submissions', initials: initials(name), tone: 'bg-blue-50 text-blue-600' };
    }),
    ...(pendingBookings.data || []).map((item) => {
      const name = profileName(item.profiles);
      return { name, detail: `Session: ${item.service_code.replaceAll('-', ' ')}`, type: 'Guidance', status: 'Pending Scheduling', submitted: relativeTime(item.created_at), href: '/admin/bookings', initials: initials(name), tone: 'bg-rose-50 text-rose-600' };
    }),
    ...(newEnquiries.data || []).map((item) => {
      const name = profileName(item.profiles);
      return { name, detail: item.interest, type: 'Support', status: 'New', submitted: relativeTime(item.created_at), href: '/admin/enquiries', initials: initials(name), tone: 'bg-emerald-50 text-emerald-600' };
    }),
  ].slice(0, 6);

  const activity = [
    ...(recentUsers.data || []).map((item) => ({ name: item.full_name || 'New user', text: 'registered as a new user.', time: item.created_at, icon: Users, tone: 'bg-blue-50 text-blue-600' })),
    ...(recentPayments.data || []).map((item) => ({ name: profileName(item.profiles).replace('Unknown user', 'A user'), text: item.status === 'paid' ? 'completed a payment.' : `payment is ${item.status}.`, time: item.created_at, icon: CreditCard, tone: 'bg-emerald-50 text-emerald-600' })),
    ...(recentAttempts.data || []).map((item) => ({ name: profileName(item.profiles).replace('Unknown user', 'A user'), text: `started a ${item.category} skill test.`, time: item.started_at, icon: FileText, tone: 'bg-amber-50 text-amber-600' })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

  const metricCards = [
    { label: 'Total Users', value: users.count || 0, note: `${activeToday.count || 0} active in the last 24 hours`, icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Active Today', value: activeToday.count || 0, note: users.count ? `${((activeToday.count || 0) / users.count * 100).toFixed(1)}% of total base` : 'No user activity yet', icon: Activity, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Monthly Revenue', value: `₹${(revenue / 100).toLocaleString('en-IN')}`, note: `${paidPayments.data?.length || 0} paid transactions`, icon: Wallet, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Tests Attempted', value: attempts.count || 0, note: `${queue.filter((item) => item.type === 'Assessment').length} pending review`, icon: BarChart3, tone: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">Operations Workspace</h1>
          <p className="mt-1 text-sm text-gray-500">Comprehensive system overview and operational metrics for Talenezio.</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminDashboardControls daily={analytics.daily} monthly={analytics.monthly} showExport showRange={false} showChart={false} />
          <div className="inline-flex items-center gap-2 rounded-xl border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm"><CalendarCheck className="h-4 w-4" />Last 30 days</div>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-start justify-between"><p className="text-sm font-medium text-gray-500">{label}</p><div className={`rounded-lg p-2 ${tone}`}><Icon className="h-5 w-5" /></div></div>
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            <p className="mt-3 flex items-center text-xs font-medium text-gray-500"><TrendingUp className="mr-1 h-3.5 w-3.5 text-emerald-600" />{note}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-8">
            <div className="w-full"><AdminDashboardControls daily={analytics.daily} monthly={analytics.monthly} title="User & Growth Analytics" /></div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Free Users</p><p className="text-xl font-bold text-gray-900">{users.count || 0}</p></div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Paid Transactions</p><p className="text-xl font-bold text-gray-900">{paidPayments.data?.length || 0}</p></div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Open Queue</p><p className="text-xl font-bold text-gray-900">{queue.length}</p></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-6"><h2 className="text-lg font-bold text-gray-900">Recent Activity</h2><span className="text-xs font-semibold text-blue-600">Live</span></div>
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {activity.length > 0 ? activity.map(({ name, text, time, icon: Icon, tone }) => <div key={`${name}-${time}`} className="flex gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}><Icon className="h-4 w-4" /></div><div><p className="text-sm text-gray-900"><span className="font-bold">{name}</span> {text}</p><p className="mt-0.5 text-xs text-gray-500">{relativeTime(time)}</p></div></div>) : <p className="text-sm text-gray-500">No recent activity.</p>}
          </div>
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6"><h2 className="text-lg font-bold text-gray-900">Pending Work Queue</h2><span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">{queue.length} Actions Required</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Task / Request</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Submitted</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{queue.map((item) => <tr key={`${item.href}-${item.name}-${item.submitted}`} className="transition-colors hover:bg-slate-50"><td className="flex items-center gap-3 px-6 py-4"><div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${item.tone}`}>{item.initials}</div><div><p className="font-bold text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.detail}</p></div></td><td className="px-6 py-4"><span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">{item.type}</span></td><td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 font-medium text-amber-600"><Clock3 className="h-3.5 w-3.5" />{item.status}</span></td><td className="px-6 py-4 text-gray-500">{item.submitted}</td><td className="px-6 py-4 text-right"><Link href={item.href} className="font-bold text-blue-600 hover:underline">Process</Link></td></tr>)}</tbody></table>{queue.length === 0 && <p className="p-10 text-center text-sm text-gray-500">Everything is up to date.</p>}</div>
        <div className="bg-slate-50 p-4 text-center"><Link href="/admin/enquiries" className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900">View entire workflow queue</Link></div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><ShieldCheck className="h-6 w-6" /></div><h2 className="font-bold text-gray-900">System Integrity</h2></div><p className="mb-6 text-sm text-gray-600">Admin data services and workflow checks are available.</p><div className="space-y-3"><div className="flex items-center justify-between text-xs font-semibold"><span className="uppercase tracking-tighter text-gray-500">Database Access</span><span className="text-emerald-600">Connected</span></div><div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full w-full bg-emerald-500" /></div><div className="flex items-center justify-between text-xs font-semibold"><span className="uppercase tracking-tighter text-gray-500">Open Workload</span><span className="text-blue-600">{queue.length} items</span></div><div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-500" style={{ width: `${Math.min(100, queue.length * 12)}%` }} /></div></div></div>
        <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"><div><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-rose-50 p-2 text-rose-600"><CalendarCheck className="h-6 w-6" /></div><h2 className="font-bold text-gray-900">Advisor Availability</h2></div><p className="text-sm text-gray-600">{pendingBookings.data?.length || 0} guidance sessions are waiting for scheduling.</p></div><Link href="/admin/bookings" className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-center text-sm font-bold text-gray-700 transition-colors hover:bg-slate-50">Manage Schedule</Link></div>
        <div className="flex flex-col justify-between rounded-3xl bg-blue-600 p-6 text-white shadow-lg"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Operational Audit</h2><p className="text-sm text-blue-100">Review the current workflow queue.</p></div><Info className="h-6 w-6 text-blue-200" /></div><Link href="/admin/enquiries" className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold transition-all hover:bg-white/30">Open Queue <ArrowUpRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  );
}
