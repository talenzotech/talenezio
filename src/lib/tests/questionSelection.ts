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

function randomSampleWithTemporaryRepeats(
  questions: Question[],
  count: number,
  randomizer: (max: number) => number,
): Question[] {
  if (questions.length === 0) {
    throw new QuestionSelectionError(`Not enough valid active questions: ${count} are required, but none are available.`);
  }

  const selected = randomSample(questions, Math.min(questions.length, count), randomizer);
  let repeatIndex = 0;
  while (selected.length < count) {
    const source = selected[repeatIndex % selected.length];
    selected.push({ ...source, id: `${source.id}-repeat-${selected.length + 1}` });
    repeatIndex += 1;
  }
  return selected;
}

export function selectQuestions(
  questions: Question[],
  type: TestType,
  randomizer: (max: number) => number = randomInt,
): Question[] {
  if (type === 'free') return randomSampleWithTemporaryRepeats(questions, 20, randomizer);
  return randomSample(questions, 45, randomizer);
}
