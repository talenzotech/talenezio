'use client'

import { useMemo, useState } from 'react'
import { Download, Network } from 'lucide-react'

export type ReferralRow = {
  id: string
  referrer_id: string
  referred_user_id: string
  code_submitted: string
  status: string
  created_at: string
  verified_at: string | null
  converted_at: string | null
  referrer_name: string
  referrer_email: string
  referred_name: string
  referred_email: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default function ReferralsClient({ rows }: { rows: ReferralRow[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesStatus = status === 'all' || row.status === status
      const matchesQuery = !normalizedQuery || [row.referrer_name, row.referrer_email, row.referred_name, row.referred_email, row.code_submitted].some((value) => value.toLowerCase().includes(normalizedQuery))
      return matchesStatus && matchesQuery
    })
  }, [query, rows, status])

  function exportCsv() {
    const header = ['Referrer name', 'Referrer email', 'Referred user', 'Referred email', 'Referral code', 'Signup date', 'Status']
    const values = filteredRows.map((row) => [row.referrer_name, row.referrer_email, row.referred_name, row.referred_email, row.code_submitted, row.created_at, row.status])
    const csv = [header, ...values].map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'talenezio-referrals.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const verified = rows.filter((row) => row.status === 'verified' || row.status === 'converted').length
  const converted = rows.filter((row) => row.status === 'converted').length

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">Referral Tracking</h1><p className="mt-1 text-sm text-gray-500">See who referred whom and follow referral status.</p></div>
        <button type="button" onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Download className="h-4 w-4" />Export CSV</button>
      </header>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Total referrals</p><p className="mt-2 text-3xl font-bold text-gray-900">{rows.length}</p></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Verified</p><p className="mt-2 text-3xl font-bold text-gray-900">{verified}</p></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Converted</p><p className="mt-2 text-3xl font-bold text-gray-900">{converted}</p></div>
      </section>
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, emails, or code" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:max-w-md" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"><option value="all">All statuses</option><option value="registered">Registered</option><option value="verified">Verified</option><option value="converted">Converted</option></select></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-4">Referrer</th><th className="px-5 py-4">Referred user</th><th className="px-5 py-4">Code</th><th className="px-5 py-4">Signup date</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{filteredRows.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-gray-900">{row.referrer_name}</p><p className="text-xs text-gray-500">{row.referrer_email}</p></td><td className="px-5 py-4"><p className="font-semibold text-gray-900">{row.referred_name}</p><p className="text-xs text-gray-500">{row.referred_email}</p></td><td className="px-5 py-4 font-mono text-xs font-semibold text-blue-700">{row.code_submitted}</td><td className="px-5 py-4 text-gray-500">{formatDate(row.created_at)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${row.status === 'converted' ? 'bg-emerald-50 text-emerald-700' : row.status === 'verified' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td></tr>)}</tbody></table></div>
        {filteredRows.length === 0 && <div className="p-12 text-center text-sm text-gray-500"><Network className="mx-auto mb-2 h-6 w-6" />No referral records found.</div>}
      </section>
    </div>
  )
}
