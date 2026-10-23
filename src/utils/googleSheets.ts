import 'server-only';

import { google } from 'googleapis';
import {
  normalizeCategory,
  parseQuestionRows,
  QuestionBankError,
  type Question,
} from '@/lib/tests/questionBank';
import { getBuiltinQuestions } from '@/lib/tests/defaultQuestions';

export type { PublicQuestion, Question } from '@/lib/tests/questionBank';
export { normalizeCategory, parseQuestionRows, QuestionBankError, toPublicQuestion } from '@/lib/tests/questionBank';

export async function fetchGoogleSheetQuestions(category: string): Promise<Question[]> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (clientEmail && privateKey && spreadsheetId) {
    const worksheet = process.env.GOOGLE_SHEETS_WORKSHEET || 'questions';
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    try {
      const response = await google.sheets({ version: 'v4', auth }).spreadsheets.values.get({
        spreadsheetId,
        range: `${worksheet}!A:K`,
      });
      const rows = response.data.values as string[][] | undefined;
      const questions = parseQuestionRows(rows ?? []);
      const normalizedCategory = normalizeCategory(category);
      const filtered = questions.filter((question) => question.category === normalizedCategory && question.isActive);
      if (filtered.length > 0) return filtered;
    } catch (error) {
      console.warn('Unable to read Google question bank, using default verified question bank:', error);
    }
  }

  const normalizedCategory = normalizeCategory(category);
  const questions = getBuiltinQuestions(normalizedCategory);
  if (questions.length === 0) {
    throw new QuestionBankError(`No questions available for category: ${category}`);
  }
  return questions;
}
