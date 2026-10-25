import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { consumeTestAttempt } from '@/lib/payments/access';
import { scoreAnswers } from '@/lib/tests/scoring';
import { buildCertificatePdf } from '@/lib/certificates/pdf';
import { isLocalDemoSession } from '@/lib/auth/local-demo';

type SnapshotQuestion = { id: string; text: string; options: string[]; correct: number };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function saveCertificatePdf(input: {
  certificateId: string;
  certificateNumber: string;
  userId: string;
  candidateName: string;
  topic: string;
  score: number;
  totalQuestions: number;
  issuedAt: string;
  performanceStatement: string;
}) {
  const pdf = await buildCertificatePdf(input);
  const path = `${input.userId}/${input.certificateNumber}.pdf`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from('certificates').upload(path, Buffer.from(pdf), {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (uploadError) {
    console.error('Unable to upload test certificate PDF:', uploadError);
    return null;
  }
  await admin.from('certificates').update({ pdf_path: path }).eq('id', input.certificateId);
  return path;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    attemptId?: string;
    answers?: Record<string, number>;
  } | null;
  if (!body?.attemptId || !body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'Invalid test submission' }, { status: 400 });
  }

  const isDemo = process.env.NODE_ENV === 'development' || (await isLocalDemoSession());
  if (isDemo && body.attemptId.startsWith('demo-attempt-')) {
    const answeredCount = Object.keys(body.answers).length;
    return NextResponse.json({
      submitted: true,
      score: Math.min(answeredCount, 18),
      total: 20,
      certificateId: 'demo-cert-' + Date.now().toString(36),
    });
  }

  if (!UUID_PATTERN.test(body.attemptId)) {
    return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const admin = createAdminClient();
  const { data: attempt, error: attemptLookupError } = await admin
    .from('test_attempts')
    .select('id, user_id, category, test_type, question_snapshot, total_questions, status, expires_at, score, submitted_at')
    .eq('id', body.attemptId)
    .maybeSingle();

  if (attemptLookupError) {
    console.error('Could not load test attempt:', {
      code: attemptLookupError.code,
      message: attemptLookupError.message,
      details: attemptLookupError.details,
      hint: attemptLookupError.hint,
    });
    return NextResponse.json({ error: 'Could not load the test attempt' }, { status: 500 });
  }

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 });
  }

  if (attempt.status === 'submitted') {
    const { data: certificate } = await admin.from('certificates').select('id').eq('attempt_id', attempt.id).maybeSingle();
    return NextResponse.json({ submitted: true, score: attempt.score, total: attempt.total_questions, certificateId: certificate?.id ?? null });
  }

  if (attempt.status !== 'in_progress' || new Date(attempt.expires_at).getTime() <= Date.now()) {
    await admin.from('test_attempts').update({ status: 'expired' }).eq('id', attempt.id).eq('status', 'in_progress');
    return NextResponse.json({ error: 'This test attempt has expired' }, { status: 409 });
  }

  const questions = attempt.question_snapshot as SnapshotQuestion[];
  let score: number;
  try {
    score = scoreAnswers(questions, body.answers);
  } catch {
    return NextResponse.json({ error: 'Invalid answer payload' }, { status: 400 });
  }

  if (attempt.test_type === 'pro') {
    try {
      if (!(await consumeTestAttempt(user.id))) {
        return NextResponse.json({ error: 'You do not have access to submit this Pro test' }, { status: 403 });
      }
    } catch (error) {
      console.error('Unable to consume test entitlement:', error);
      return NextResponse.json({ error: 'Could not validate test access' }, { status: 500 });
    }
  }

  const { data: submittedAttempt, error: submitError } = await admin
    .from('test_attempts')
    .update({ answers: body.answers, score, status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', attempt.id)
    .eq('status', 'in_progress')
    .select('id, score, total_questions, submitted_at')
    .maybeSingle();

  if (submitError || !submittedAttempt) {
    const { data: existingAttempt } = await admin.from('test_attempts').select('score, total_questions, status').eq('id', attempt.id).single();
    if (existingAttempt?.status === 'submitted') {
      const { data: certificate } = await admin.from('certificates').select('id').eq('attempt_id', attempt.id).maybeSingle();
      return NextResponse.json({ submitted: true, score: existingAttempt.score, total: existingAttempt.total_questions, certificateId: certificate?.id ?? null });
    }
    return NextResponse.json({ error: 'Could not save test result' }, { status: 500 });
  }

  const candidateName = (await admin.from('profiles').select('full_name').eq('id', user.id).maybeSingle()).data?.full_name || user.user_metadata?.full_name || 'Talenezio learner';
  const percentage = Math.round((score / attempt.total_questions) * 10000) / 100;
  const certificateNumber = `TAL-TEST-${attempt.id.slice(0, 8).toUpperCase()}`;
  const performanceStatement = `Scored ${score} out of ${attempt.total_questions} (${percentage}%).`;
  const { data: certificate, error: certificateError } = await admin.from('certificates').insert({
    user_id: user.id,
    attempt_id: attempt.id,
    certificate_number: certificateNumber,
    certificate_type: 'test_completion',
    candidate_name: candidateName,
    topic: attempt.category,
    performance_statement: performanceStatement,
    score: percentage,
  }).select('id, certificate_number, issued_at').single();

  if (certificateError || !certificate) {
    console.error('Unable to create test certificate:', certificateError);
    return NextResponse.json({ error: 'Test result saved, but certificate creation failed' }, { status: 500 });
  }

  await saveCertificatePdf({
    certificateId: certificate.id,
    certificateNumber: certificate.certificate_number,
    userId: user.id,
    candidateName,
    topic: attempt.category,
    score,
    totalQuestions: attempt.total_questions,
    issuedAt: certificate.issued_at,
    performanceStatement,
  });

  return NextResponse.json({ submitted: true, score, total: attempt.total_questions, certificateId: certificate.id });
}
