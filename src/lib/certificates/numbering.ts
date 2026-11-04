export const CERTIFICATE_TIME_ZONE = 'Asia/Kolkata';

export const CERTIFICATE_SUBJECT_CODES: Readonly<Record<string, string>> = {
  'digital-marketing': '1',
  finance: '2',
  ai: '3',
  technology: '4', // The Software Engineering track is named Technology & Software in the app.
};

export function certificateInitials(name: string): string {
  const words = name.trim().split(/\s+/).map((word) => word
    .replace(/ß/g, 'ss').replace(/[Ææ]/g, 'ae').replace(/[Œœ]/g, 'oe')
    .replace(/[Øø]/g, 'o').replace(/[Ðð]/g, 'd').replace(/[Þþ]/g, 'th')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/gi, '').toUpperCase()).filter(Boolean);
  if (!words.length) throw new Error('The certificate name must contain letters.');
  if (words.length === 1) return words[0].slice(0, 2).padEnd(2, words[0][0]);
  const selected = words.length > 3 ? [words[0], words[1], words[words.length - 1]] : words;
  return selected.map((word) => word[0]).join('');
}

export function certificateDateParts(issuedAt: string) {
  const date = new Date(issuedAt);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid certificate issue date.');
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CERTIFICATE_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)!.value;
  return { day: value('day'), month: value('month'), year: value('year') };
}

export function buildCertificateNumberBase(input: {
  category: string;
  testType: string;
  score: number;
  candidateName: string;
  issuedAt: string;
}): string {
  if (!Object.hasOwn(CERTIFICATE_SUBJECT_CODES, input.category)) throw new Error('Invalid certificate subject.');
  if (input.testType !== 'free' && input.testType !== 'pro') throw new Error('Invalid certificate test type.');
  if (!Number.isSafeInteger(input.score) || input.score < 0) throw new Error('Invalid certificate score.');
  const { day, month, year } = certificateDateParts(input.issuedAt);
  return `${CERTIFICATE_SUBJECT_CODES[input.category]}${day}${month}${year.slice(-2)}${input.score}${input.testType === 'pro' ? 'A' : 'B'}${certificateInitials(input.candidateName)}`;
}
