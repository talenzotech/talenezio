import 'server-only';

import { google } from 'googleapis';
import {
  normalizeCategory,
  parseQuestionRows,
  QuestionBankError,
  type Question,
} from '@/lib/tests/questionBank';

export type { PublicQuestion, Question } from '@/lib/tests/questionBank';
export { normalizeCategory, parseQuestionRows, QuestionBankError, toPublicQuestion } from '@/lib/tests/questionBank';

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new QuestionBankError(`Question bank is unavailable: ${name} is not configured.`);
  return value;
}

export async function fetchGoogleSheetQuestions(category: string): Promise<Question[]> {
  const clientEmail = requiredEnvironment('GOOGLE_SHEETS_CLIENT_EMAIL');
  const privateKey = requiredEnvironment('GOOGLE_SHEETS_PRIVATE_KEY').replace(/\\n/g, '\n');
  const spreadsheetId = requiredEnvironment('GOOGLE_SHEETS_ID');
  const worksheet = process.env.GOOGLE_SHEETS_WORKSHEET || 'questions';
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  let rows: string[][] | undefined;
  try {
    const response = await google.sheets({ version: 'v4', auth }).spreadsheets.values.get({
      spreadsheetId,
      range: `${worksheet}!A:K`,
    });
    rows = response.data.values as string[][] | undefined;
  } catch (error) {
    console.error('Unable to read Google question bank:', error);
    throw new QuestionBankError('Question bank is unavailable. Check the Google Sheets credentials, spreadsheet ID, worksheet name, and sharing permissions.');
  }

  const questions = parseQuestionRows(rows ?? []);
  const normalizedCategory = normalizeCategory(category);
  return questions.filter((question) => question.category === normalizedCategory && question.isActive);
}
