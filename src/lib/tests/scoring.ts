export type ScoringQuestion = { id: string; correct: number };

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
