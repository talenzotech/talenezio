import { createAdminClient } from '@/lib/supabase/admin';
import { ClipboardCheck } from 'lucide-react';

export const revalidate = 0;

export default async function AdminTestsPage() {
  const admin = createAdminClient();
  const { data: attempts } = await admin.from('test_attempts').select('id, category, test_type, score, total_questions, status, started_at, profiles:user_id(full_name)').order('started_at', { ascending: false });

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">Skill Test Attempts</h1><p className="mt-1 text-sm text-gray-500">Monitor assessment progress and submitted results.</p></header>
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Candidate</th><th className="px-6 py-4">Assessment</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Score</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Started</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{(attempts || []).map((attempt) => { const profile = Array.isArray(attempt.profiles) ? attempt.profiles[0] : attempt.profiles; return <tr key={attempt.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-semibold text-gray-900">{profile?.full_name || 'Unknown user'}</td><td className="px-6 py-4 capitalize text-gray-600">{attempt.category}</td><td className="px-6 py-4"><span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium capitalize text-purple-600">{attempt.test_type}</span></td><td className="px-6 py-4 font-semibold text-gray-900">{attempt.score === null ? 'Pending' : `${attempt.score}/${attempt.total_questions}`}</td><td className="px-6 py-4 capitalize text-gray-500">{attempt.status.replace('_', ' ')}</td><td className="px-6 py-4 text-gray-500">{new Date(attempt.started_at).toLocaleString()}</td></tr>})}</tbody></table></div>{(!attempts || attempts.length === 0) && <div className="p-12 text-center text-sm text-gray-500"><ClipboardCheck className="mx-auto mb-2 h-6 w-6" />No test attempts found.</div>}</div>
    </div>
  );
}
