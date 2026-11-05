import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!await getAdminUser()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminClient();
  const [users, payments, attempts, submissions, bookings, enquiries] = await Promise.all([
    admin.from('profiles').select('id, full_name, is_admin, created_at').order('created_at', { ascending: false }),
    admin.from('payments').select('id, user_id, product_code, amount_paise, currency, status, provider, created_at').order('created_at', { ascending: false }),
    admin.from('test_attempts').select('id, user_id, category, test_type, score, total_questions, status, started_at, submitted_at').order('started_at', { ascending: false }),
    admin.from('unlock_submissions').select('id, user_id, feature_code, status, created_at').order('created_at', { ascending: false }),
    admin.from('bookings').select('id, user_id, service_code, status, scheduled_for, created_at').order('created_at', { ascending: false }),
    admin.from('service_enquiries').select('id, user_id, service_code, interest, status, created_at').order('created_at', { ascending: false }),
  ]);

  const rows = [
    ['record_type', 'id', 'user_id', 'name', 'product_or_service', 'amount_paise', 'currency', 'status', 'category_or_interest', 'test_type', 'score', 'total_questions', 'scheduled_for', 'created_at', 'submitted_at'],
    ...(users.data || []).map((item) => ['user', item.id, item.id, item.full_name, '', '', '', item.is_admin ? 'admin' : 'user', '', '', '', '', '', item.created_at, '']),
    ...(payments.data || []).map((item) => ['payment', item.id, item.user_id, '', item.product_code, item.amount_paise, item.currency, item.status, '', '', '', '', '', item.created_at, '']),
    ...(attempts.data || []).map((item) => ['test_attempt', item.id, item.user_id, '', '', '', '', item.status, item.category, item.test_type, item.score, item.total_questions, '', item.started_at, item.submitted_at || '']),
    ...(submissions.data || []).map((item) => ['unlock_submission', item.id, item.user_id, '', item.feature_code || '', '', '', item.status, '', '', '', '', '', item.created_at, '']),
    ...(bookings.data || []).map((item) => ['booking', item.id, item.user_id, '', item.service_code, '', '', item.status, '', '', '', '', item.scheduled_for || '', item.created_at, '']),
    ...(enquiries.data || []).map((item) => ['service_enquiry', item.id, item.user_id, '', item.service_code, '', '', item.status, item.interest, '', '', '', '', item.created_at, '']),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="talenezio-admin-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
