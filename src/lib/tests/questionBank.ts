const REQUIRED_HEADERS = [
  'id', 'category', 'section', 'question', 'option_a', 'option_b', 'option_c',
  'option_d', 'correct_option', 'difficulty', 'is_active',
] as const;

const CATEGORY_ALIASES: Record<string, string> = {
  ai: 'ai',
  technology: 'technology',
  finance: 'finance',
  'digital marketing': 'digital-marketing',
  'digital-marketing': 'digital-marketing',
};

const VALID_SECTIONS = new Set(['section-1', 'section-2', 'section-3']);
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

export type Question = {
  id: string;
  category: string;
  section: 'section-1' | 'section-2' | 'section-3';
  text: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
};

export type PublicQuestion = Omit<Question, 'correct' | 'isActive'>;

export class QuestionBankError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuestionBankError';
  }
}

export function toPublicQuestion(question: Question): PublicQuestion {
  return Object.fromEntries(
    Object.entries(question).filter(([key]) => key !== 'correct' && key !== 'isActive'),
  ) as PublicQuestion;
}

export function normalizeCategory(value: string): string {
  return CATEGORY_ALIASES[value.trim().toLowerCase()] ?? '';
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase();
}

function parseBoolean(value: string, rowNumber: number): boolean {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'TRUE') return true;
  if (normalized === 'FALSE') return false;
  throw new QuestionBankError(`Question bank row ${rowNumber}: is_active must be TRUE or FALSE.`);
}

export function parseQuestionRows(rows: string[][]): Question[] {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) throw new QuestionBankError('Question bank is invalid: the worksheet is empty.');

  const headers = headerRow.map(normalizeHeader);
  const headerIndexes = new Map(headers.map((header, index) => [header, index]));
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headerIndexes.has(header));
  if (missingHeaders.length > 0) {
    throw new QuestionBankError(`Question bank is invalid: missing columns ${missingHeaders.join(', ')}.`);
  }

  const errors: string[] = [];
  const questions: Question[] = [];
  const ids = new Set<string>();
  const value = (row: string[], header: (typeof REQUIRED_HEADERS)[number]) => row[headerIndexes.get(header)!]?.trim() ?? '';

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.every((cell) => !cell?.trim())) return;

    try {
      const id = value(row, 'id');
      const category = normalizeCategory(value(row, 'category'));
      const section = value(row, 'section').toLowerCase() as Question['section'];
      const text = value(row, 'question');
      const options = ['option_a', 'option_b', 'option_c', 'option_d'].map((header) => value(row, header as (typeof REQUIRED_HEADERS)[number]));
      const correctOption = value(row, 'correct_option').toUpperCase();
      const difficulty = value(row, 'difficulty').toLowerCase() as Question['difficulty'];
      const isActive = parseBoolean(value(row, 'is_active'), rowNumber);

      if (!id) throw new QuestionBankError(`Question bank row ${rowNumber}: id is required.`);
      if (ids.has(id)) throw new QuestionBankError(`Question bank row ${rowNumber}: duplicate id "${id}".`);
      if (!category) throw new QuestionBankError(`Question bank row ${rowNumber}: category is invalid.`);
      if (!VALID_SECTIONS.has(section)) throw new QuestionBankError(`Question bank row ${rowNumber}: section must be section-1, section-2, or section-3.`);
      if (!text) throw new QuestionBankError(`Question bank row ${rowNumber}: question is required.`);
      if (options.some((option) => !option)) throw new QuestionBankError(`Question bank row ${rowNumber}: all four options are required.`);
      if (!/^[A-D]$/.test(correctOption)) throw new QuestionBankError(`Question bank row ${rowNumber}: correct_option must be A, B, C, or D.`);
      if (!VALID_DIFFICULTIES.has(difficulty)) throw new QuestionBankError(`Question bank row ${rowNumber}: difficulty must be easy, medium, or hard.`);

      ids.add(id);
      questions.push({
        id, category, section, text, options,
        correct: correctOption.charCodeAt(0) - 'A'.charCodeAt(0),
        difficulty, isActive,
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Question bank row ${rowNumber}: invalid data.`);
    }
  });

  if (errors.length > 0) {
    throw new QuestionBankError(`Question bank validation failed:\n${errors.join('\n')}`);
  }
  return questions;
}
