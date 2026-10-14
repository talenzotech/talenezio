import Papa from 'papaparse';


const SHEET_ID = '1NiS-GtrYAjXpIByKPszRJhcFP8UrRRAefQu7U2gNJsI';
// We use gid=0 for free questions and the specific gid for paid questions.
const FREE_GID = '0';
const PRO_GID = '414130213';

export type Question = {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string | null;
  category?: string;
};

export type PublicQuestion = Omit<Question, 'correct'>;

export function toPublicQuestion(question: Question): PublicQuestion {
  return Object.fromEntries(
    Object.entries(question).filter(([key]) => key !== 'correct'),
  ) as PublicQuestion;
}

export async function fetchGoogleSheetQuestions(
  category: string,
  type: 'free' | 'pro'
): Promise<Question[]> {
  const gid = type === 'pro' ? PRO_GID : FREE_GID;
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds to avoid hitting Google Sheets limits
    });

    if (!response.ok) {
      console.error('Failed to fetch Google Sheet. Is it public?', response.statusText);
      return [];
    }

    const csvData = await response.text();
    
    // Check if we hit a Google login page (which happens if the sheet isn't public)
    if (csvData.includes('<html') || csvData.includes('<!DOCTYPE html>')) {
      console.error('Received HTML instead of CSV. Please ensure the Google Sheet is set to "Anyone with the link can view".');
      return [];
    }

    const parsed = Papa.parse(csvData, { skipEmptyLines: true });
    const rows = parsed.data as string[][];

    const questions: Question[] = [];
    let currentCategory = '';

    for (const row of rows) {
      // Based on the screenshot, Column A is empty, Column B has questions/headers
      const colB = row[1]?.trim();
      
      if (!colB) continue;

      // Detect header row (e.g. "Digital Marketing", "AI")
      // A header row usually has text in colB, but no options in col C or D.
      if (colB && !row[2] && !row[3] && colB !== 'Question') {
        const headerText = colB.toLowerCase();
        if (headerText.includes('digital marketing')) currentCategory = 'digital-marketing';
        else if (headerText.includes('ai') || headerText.includes('artificial intelligence')) currentCategory = 'ai';
        else if (headerText.includes('technology')) currentCategory = 'technology';
        else if (headerText.includes('finance')) currentCategory = 'finance';
        continue;
      }

      // Check if it's a data row and matches the requested category
      if (currentCategory === category && colB !== 'Question' && row[6]) {
        const correctLetter = row[6].trim().toUpperCase();
        let correctIndex = 0;
        if (correctLetter === 'B') correctIndex = 1;
        if (correctLetter === 'C') correctIndex = 2;
        if (correctLetter === 'D') correctIndex = 3;

        questions.push({
          id: crypto.randomUUID(),
          text: colB,
          options: [
            row[2]?.trim() || '',
            row[3]?.trim() || '',
            row[4]?.trim() || '',
            row[5]?.trim() || '',
          ],
          correct: correctIndex,
          explanation: null, // You can add explanation to column H in the future!
        });
      }
    }

    return questions;
  } catch (error) {
    console.error('Error fetching questions from Google Sheets:', error);
    return [];
  }
}
