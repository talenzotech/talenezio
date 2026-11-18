import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCertificatePdf } from '@/lib/certificates/pdf';
import { buildCertificateNumberBase, certificateInitials } from '@/lib/certificates/numbering';
import { isLocalDemoSession } from '@/lib/auth/local-demo';
import { normalizeCategory } from '@/lib/tests/questionBank';

const topicNames: Record<string, string> = {
  technology: 'Technology & Software', finance: 'Finance',
  'digital-marketing': 'Digital Marketing', ai: 'Artificial Intelligence',
};

type AllocatedCertificate = {
  id: string;
  attempt_id: string;
  certificate_number: string;
  candidate_name: string | null;
  issued_at: string;
  pdf_path: string | null;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { attemptId?: string; candidateName?: string } | null;
  const name = typeof body?.candidateName === 'string' ? body.candidateName.trim().replace(/\s+/g, ' ') : '';
  if (!body?.attemptId || !name || name.length > 100 || !/^[\x20-\x7e\xa0-\xff]+$/.test(name)) {
    return NextResponse.json({ error: 'Enter a valid name of up to 100 characters using supported Latin characters.' }, { status: 400 });
  }
  try {
    certificateInitials(name);
  } catch {
    return NextResponse.json({ error: 'The certificate name must contain letters.' }, { status: 400 });
  }

  // Handle demo sessions and local development mock attempts
  const isDemo = process.env.NODE_ENV === 'development' && ((await isLocalDemoSession()) || !process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (isDemo && body.attemptId.startsWith('demo-')) {
    return NextResponse.json({ certificateId: 'demo-cert-' + Date.now().toString(36) });
  }

  if (!/^[0-9a-f-]{36}$/i.test(body.attemptId)) {
    return NextResponse.json({ error: 'Invalid test attempt ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const admin = createAdminClient();
  const { data: attempt } = await admin.from('test_attempts')
    .select('id, user_id, status, category, test_type, score, total_questions, certificate_id')
    .eq('id', body.attemptId)
    .maybeSingle();

  if (!attempt) {
    return NextResponse.json({ error: 'Completed test not found' }, { status: 404 });
  }

  if (attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'You do not have permission to generate this certificate' }, { status: 403 });
  }

  // Preserve lifecycle rule: certificates can only be generated for legitimately submitted attempts
  if (attempt.status !== 'submitted' || attempt.score === null) {
    return NextResponse.json({ error: 'Completed test not found' }, { status: 404 });
  }

  const categoryKey = normalizeCategory(attempt.category) || attempt.category;
  const topicTitle = topicNames[categoryKey] || topicNames[attempt.category] || attempt.category;

  // If certificate was already allocated for this attempt:
  if (attempt.certificate_id) {
    const { data: existingCert } = await admin
      .from('certificates')
      .select('id, attempt_id, certificate_number, candidate_name, issued_at, pdf_path')
      .eq('id', attempt.certificate_id)
      .maybeSingle<AllocatedCertificate>();

    if (existingCert?.id) {
      // If PDF is already stored and ready, return immediately
      if (existingCert.pdf_path) {
        return NextResponse.json({ certificateId: existingCert.id });
      }

      // Retry PDF generation and storage upload if previous attempt failed to upload
      try {
        const certCandidateName = existingCert.candidate_name || name;
        const pdf = await buildCertificatePdf({
          candidateName: certCandidateName,
          certificateNumber: existingCert.certificate_number,
          topic: topicTitle,
          score: attempt.score,
          totalQuestions: attempt.total_questions,
          issuedAt: existingCert.issued_at,
        });

        const pdfPath = `${user.id}/${existingCert.id}/${attempt.id}.pdf`;
        const { error: uploadError } = await admin.storage
          .from('certificates')
          .upload(pdfPath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });

        if (uploadError) throw uploadError;

        const { data: updated, error: updateError } = await admin
          .from('certificates')
          .update({ pdf_path: pdfPath })
          .eq('id', existingCert.id)
          .eq('attempt_id', attempt.id)
          .select('id')
          .maybeSingle();

        if (updateError) throw updateError;
        if (!updated) {
          return NextResponse.json({ error: 'A newer result is updating this certificate. Please retry.' }, { status: 409 });
        }

        return NextResponse.json({ certificateId: existingCert.id });
      } catch (retryError) {
        console.error('Certificate retry PDF generation failed:', retryError);
        return NextResponse.json({ error: 'Unable to generate certificate. Please retry.' }, { status: 500 });
      }
    }
  }

  try {
    const issuedAt = new Date().toISOString();
    const categoryKey = normalizeCategory(attempt.category) || attempt.category;
    const numberBase = buildCertificateNumberBase({
      category: categoryKey, testType: attempt.test_type, score: attempt.score,
      candidateName: name, issuedAt,
    });
    const { data: certificate, error: allocationError } = await admin.rpc('allocate_test_certificate', {
      p_attempt_id: attempt.id, p_user_id: user.id, p_name: name,
      p_base: numberBase, p_issued_at: issuedAt,
    }).single<AllocatedCertificate>();
    if (allocationError || !certificate) throw allocationError || new Error('Certificate allocation failed');
    if (certificate.pdf_path) return NextResponse.json({ certificateId: certificate.id });
    const pdf = await buildCertificatePdf({
      candidateName: certificate.candidate_name || name, certificateNumber: certificate.certificate_number,
      topic: topicNames[categoryKey] || topicNames[attempt.category] || attempt.category, score: attempt.score,
      totalQuestions: attempt.total_questions, issuedAt: certificate.issued_at,
    });
    const pdfPath = `${user.id}/${certificate.id}/${certificate.attempt_id}.pdf`;
    const { error: uploadError } = await admin.storage.from('certificates').upload(pdfPath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw uploadError;
    const { data: updated, error: updateError } = await admin.from('certificates').update({ pdf_path: pdfPath })
      .eq('id', certificate.id).eq('attempt_id', certificate.attempt_id).select('id').maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ error: 'A newer result is updating this certificate. Please retry.' }, { status: 409 });
    return NextResponse.json({ certificateId: certificate.id });
  } catch (error) {
    console.error('Certificate generation failed:', error);
    return NextResponse.json({ error: 'Unable to generate certificate. Please retry.' }, { status: 500 });
  }
}
