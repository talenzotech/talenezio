export type ScoringQuestion = { id: string; correct: number };

// 30-second server grace period accommodates timer countdown and network transit latency on auto-submit
export const SUBMISSION_GRACE_PERIOD_MS = 30 * 1000;

export function isAttemptExpired(
  expiresAt: string | Date,
  currentMs: number = Date.now(),
  gracePeriodMs: number = SUBMISSION_GRACE_PERIOD_MS,
): boolean {
  const expiresAtMs = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt.getTime();
  if (isNaN(expiresAtMs)) return true;
  return currentMs > (expiresAtMs + gracePeriodMs);
}

export function scoreAnswers(
  questions: ScoringQuestion[],
  answers: Record<string, number>,
): number {
  const questionIds = new Set(questions.map((question) => question.id));
  for (const [questionId, answer] of Object.entries(answers)) {
    if (!questionIds.has(questionId) || !Number.isInteger(answer) || answer < 0 || answer > 3) {
      throw new Error('Invalid answer payload');
    }
  }

  return questions.reduce((score, question) => (
    answers[question.id] === question.correct ? score + 1 : score
  ), 0);
}
