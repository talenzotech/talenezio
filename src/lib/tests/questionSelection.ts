import { randomInt } from 'node:crypto';
import type { Question } from '@/utils/googleSheets';

export type TestType = 'free' | 'pro';

export class QuestionSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuestionSelectionError';
  }
}

function randomSample(questions: Question[], count: number, randomizer: (max: number) => number): Question[] {
  if (questions.length < count) {
    throw new QuestionSelectionError(`Not enough valid active questions: ${count} are required, but only ${questions.length} are available.`);
  }

  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomizer(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

export function selectQuestions(
  questions: Question[],
  type: TestType,
  randomizer: (max: number) => number = randomInt,
): Question[] {
  if (type === 'free') return randomSample(questions, 20, randomizer);

  const sections = ['section-1', 'section-2', 'section-3'] as const;
  return sections.flatMap((section) => {
    const sectionQuestions = questions.filter((question) => question.section === section);
    return randomSample(sectionQuestions, 15, randomizer);
  });
}
