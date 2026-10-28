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

export async function fetchGoogleSheetQuestions(category: string, type: 'free' | 'pro' = 'free'): Promise<Question[]> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (clientEmail && privateKey && spreadsheetId) {
    const worksheet = type === 'pro'
      ? process.env.GOOGLE_SHEETS_PAID_WORKSHEET || 'Paid'
      : process.env.GOOGLE_SHEETS_FREE_WORKSHEET || 'Free';
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    try {
      const sheets = google.sheets({ version: 'v4', auth });
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      });
      const titles = (metadata.data.sheets ?? []).map((sheet) => sheet.properties?.title).filter((title): title is string => Boolean(title));
      const matches = titles.filter((title) => title.trim() === worksheet.trim());
      const title = titles.includes(worksheet) ? worksheet : matches.length === 1 ? matches[0] : null;
      if (!title) throw new Error(`Worksheet ${JSON.stringify(worksheet)} was not found or is ambiguous.`);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${title.replace(/'/g, "''")}'!A:K`,
      });
      const rows = response.data.values as string[][] | undefined;
      const questions = parseQuestionRows(rows ?? []);
      const normalizedCategory = normalizeCategory(category);
      const filtered = questions.filter((question) => question.category === normalizedCategory && question.isActive);
      if (filtered.length > 0) return filtered;
      throw new QuestionBankError(`No active questions available for ${category} in the ${worksheet} worksheet.`);
    } catch (error) {
      console.error('Unable to read Google question bank:', error);
      throw new QuestionBankError('The question bank is currently unavailable. Please try again later.');
    }
  }

  console.error('Google Sheets question bank is not configured.');
  throw new QuestionBankError('The question bank is currently unavailable. Please try again later.');
}
