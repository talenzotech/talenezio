import 'server-only';

import { google } from 'googleapis';
import {
  normalizeCategory,
  parseQuestionRows,
  QuestionBankError,
  type Question,
} from '@/lib/tests/questionBank';
import { DEFAULT_QUESTIONS } from '@/lib/tests/defaultQuestions';

export type { PublicQuestion, Question } from '@/lib/tests/questionBank';
export { normalizeCategory, parseQuestionRows, QuestionBankError, toPublicQuestion } from '@/lib/tests/questionBank';

function getFallbackQuestions(category: string, type: 'free' | 'pro'): Question[] {
  const normalizedCategory = normalizeCategory(category);
  const catQuestions = DEFAULT_QUESTIONS.filter(
    (q) => q.category === normalizedCategory && q.isActive,
  );
  if (catQuestions.length === 0) {
    throw new QuestionBankError(`No questions available for category "${category}".`);
  }
  return type === 'pro' ? catQuestions.slice(20) : catQuestions.slice(0, 20);
}

export async function fetchGoogleSheetQuestions(category: string, type: 'free' | 'pro' = 'free'): Promise<Question[]> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  const hasAnyConfig = Boolean(clientEmail || privateKey || spreadsheetId);
  const isFullyConfigured = Boolean(clientEmail && privateKey && spreadsheetId);

  if (hasAnyConfig && !isFullyConfigured) {
    console.error('[GoogleSheetsConfigError] Incomplete Google Sheets configuration. Check environment variables:', {
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey),
      hasSpreadsheetId: Boolean(spreadsheetId),
    });
  }

  if (isFullyConfigured) {
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
    } catch (error: any) {
      const isConfigOrAuthError =
        error?.code === 401 ||
        error?.code === 403 ||
        error?.message?.includes('invalid_grant') ||
        error?.message?.includes('PEM') ||
        error?.message?.includes('Worksheet') ||
        error instanceof QuestionBankError;

      if (isConfigOrAuthError) {
        console.error('[GoogleSheetsConfigError] Configuration or credential error reading Google question bank:', error);
      } else {
        console.warn('[GoogleSheetsTransientWarning] Transient error reading Google question bank, falling back to verified default questions:', error);
      }
      return getFallbackQuestions(category, type);
    }
  }

  // Google Sheets credentials not configured; use verified default questions bank
  return getFallbackQuestions(category, type);
}
