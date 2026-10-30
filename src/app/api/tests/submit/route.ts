import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { consumeTestAttempt } from '@/lib/payments/access';
import { scoreAnswers } from '@/lib/tests/scoring';
import { isLocalDemoSession } from '@/lib/auth/local-demo';
import { DEFAULT_QUESTIONS } from '@/lib/tests/defaultQuestions';
import { fetchGoogleSheetQuestions } from '@/utils/googleSheets';

type SnapshotQuestion = { id: string; text: string; options: string[]; correct: number };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    attemptId?: string;
    answers?: Record<string, number>;
    category?: string;
    type?: 'free' | 'pro';
    questionIds?: string[];
  } | null;
  if (!body?.attemptId || !body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'Invalid test submission' }, { status: 400 });
  }

  const isDemo = process.env.NODE_ENV === 'development' && ((await isLocalDemoSession()) || !process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (isDemo && body.attemptId.startsWith('demo-attempt-')) {
    let scoringQuestions: { id: string; correct: number }[] = [];

    if (body.category) {
      try {
        const questions = await fetchGoogleSheetQuestions(body.category, body.type || 'free');
        scoringQuestions = questions.map(q => ({ id: q.id, correct: q.correct }));
      } catch {
        // Fallback to default questions
      }
    }

    if (scoringQuestions.length === 0) {
      scoringQuestions = DEFAULT_QUESTIONS.map(q => ({ id: q.id, correct: q.correct }));
    }

    if (Array.isArray(body.questionIds) && body.questionIds.length > 0) {
      const qMap = new Map(scoringQuestions.map(q => [q.id, q]));
      scoringQuestions = body.questionIds.map(id => qMap.get(id) || { id, correct: -1 });
    }

    let score = 0;
    try {
      score = scoreAnswers(scoringQuestions, body.answers);
    } catch {
      const scoringMap = new Map(scoringQuestions.map(q => [q.id, q.correct]));
      for (const [qId, ans] of Object.entries(body.answers)) {
        if (scoringMap.has(qId) && scoringMap.get(qId) === ans) {
          score += 1;
        }
      }
    }

    const total = Array.isArray(body.questionIds) && body.questionIds.length > 0
      ? body.questionIds.length
      : (body.type === 'pro' ? 45 : 20);

    return NextResponse.json({
      submitted: true,
      score,
      total,
      certificateId: 'demo-cert-' + Date.now().toString(36),
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from('test_attempts')
    .select('id, user_id, category, test_type, question_snapshot, total_questions, status, expires_at, score, submitted_at')
    .eq('id', body.attemptId)
    .maybeSingle();

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

  return NextResponse.json({ submitted: true, score, total: attempt.total_questions, certificateId: null });
}
