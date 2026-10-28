import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCertificatePdf } from '@/lib/certificates/pdf';

const topicNames: Record<string, string> = {
  technology: 'Technology & Software', finance: 'Finance',
  'digital-marketing': 'Digital Marketing', ai: 'Artificial Intelligence',
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { attemptId?: string; candidateName?: string } | null;
  const name = typeof body?.candidateName === 'string' ? body.candidateName.trim().replace(/\s+/g, ' ') : '';
  if (!body?.attemptId || !/^[0-9a-f-]{36}$/i.test(body.attemptId) || !name || name.length > 100 || !/^[\x20-\x7e\xa0-\xff]+$/.test(name)) {
    return NextResponse.json({ error: 'Enter a valid name of up to 100 characters using supported Latin characters.' }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const admin = createAdminClient();
  const { data: attempt } = await admin.from('test_attempts')
    .select('id, user_id, status, category, score, total_questions')
    .eq('id', body.attemptId).eq('user_id', user.id).maybeSingle();
  if (!attempt || attempt.status !== 'submitted' || attempt.score === null) {
    return NextResponse.json({ error: 'Completed test not found' }, { status: 404 });
  }

  let { data: certificate } = await admin.from('certificates').select('id, certificate_number, candidate_name, issued_at, pdf_path')
    .eq('attempt_id', attempt.id).maybeSingle();
  if (!certificate) {
    const { data } = await admin.from('certificates').insert({
      user_id: user.id, attempt_id: attempt.id,
      certificate_number: `TAL-${attempt.id.toUpperCase()}`,
      certificate_type: 'test_completion', candidate_name: name,
      topic: attempt.category, score: Math.round(attempt.score / attempt.total_questions * 10000) / 100,
    }).select('id, certificate_number, candidate_name, issued_at, pdf_path').maybeSingle();
    certificate = data;
    if (!certificate) {
      const existing = await admin.from('certificates').select('id, certificate_number, candidate_name, issued_at, pdf_path').eq('attempt_id', attempt.id).maybeSingle();
      certificate = existing.data;
    }
  }
  if (!certificate) return NextResponse.json({ error: 'Unable to create certificate. Please retry.' }, { status: 500 });
  if (certificate.pdf_path) return NextResponse.json({ certificateId: certificate.id });
  try {
    const pdf = await buildCertificatePdf({
      candidateName: certificate.candidate_name || name, certificateNumber: certificate.certificate_number,
      topic: topicNames[attempt.category] || attempt.category, score: attempt.score,
      totalQuestions: attempt.total_questions, issuedAt: certificate.issued_at,
    });
    const pdfPath = `${user.id}/${certificate.certificate_number}.pdf`;
    const { error: uploadError } = await admin.storage.from('certificates').upload(pdfPath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw uploadError;
    const { error: updateError } = await admin.from('certificates').update({ pdf_path: pdfPath }).eq('id', certificate.id);
    if (updateError) throw updateError;
    return NextResponse.json({ certificateId: certificate.id });
  } catch (error) {
    console.error('Certificate generation failed:', error);
    return NextResponse.json({ error: 'Unable to generate certificate. Please retry.' }, { status: 500 });
  }
}
