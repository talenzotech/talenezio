import { createAdminClient } from '@/lib/supabase/admin';
import { UserRound } from 'lucide-react';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: users } = await admin.from('profiles').select('id, full_name, avatar_url, is_admin, created_at').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">User Management</h1><p className="mt-1 text-sm text-gray-500">Review registered users and their access level.</p></header>
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Access</th><th className="px-6 py-4">Joined</th><th className="px-6 py-4">User ID</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{(users || []).map((user) => <tr key={user.id} className="hover:bg-slate-50"><td className="flex items-center gap-3 px-6 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">{(user.full_name || 'U').charAt(0).toUpperCase()}</div><span className="font-semibold text-gray-900">{user.full_name || 'Unnamed user'}</span></td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_admin ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{user.is_admin ? 'Administrator' : 'User'}</span></td><td className="px-6 py-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td><td className="px-6 py-4 font-mono text-xs text-gray-400">{user.id}</td></tr>)}</tbody></table></div>
        {(!users || users.length === 0) && <div className="p-12 text-center text-sm text-gray-500"><UserRound className="mx-auto mb-2 h-6 w-6" />No users found.</div>}
      </div>
    </div>
  );
}
