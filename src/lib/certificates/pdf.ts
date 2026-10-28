import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

export async function buildCertificatePdf(input: {
  candidateName: string;
  certificateNumber: string;
  topic: string;
  score: number;
  totalQuestions: number;
  issuedAt: string;
  performanceStatement?: string;
}): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  // The supplied template is 3:2; preserve its proportions instead of stretching it to A4.
  const width = 900;
  const height = 600;
  const page = document.addPage([width, height]);
  const template = await document.embedPng(await readFile(path.join(process.cwd(), 'public', 'talenezio-certificate-blank-template-hd.png')));
  page.drawImage(template, { x: 0, y: 0, width, height });
  const nameFont = await document.embedFont(StandardFonts.TimesRomanBoldItalic);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const color = rgb(0.02, 0.03, 0.29);

  function centered(text: string, center: number, y: number, size: number, maxWidth: number, font: PDFFont) {
    const textWidth = font.widthOfTextAtSize(text, size);
    const fittedSize = textWidth > maxWidth ? size * maxWidth / textWidth : size;
    page.drawText(text, { x: center - font.widthOfTextAtSize(text, fittedSize) / 2, y, size: fittedSize, font, color });
  }

  const date = new Date(input.issuedAt);
  const day = date.getUTCDate();
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] || 'th';
  const formattedDate = `${day}${suffix} ${date.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })} ${date.getUTCFullYear()}`;

  centered(input.candidateName, 450, 310, 52, 460, nameFont);
  centered(input.topic, 450, 229, 25, 650, boldFont);
  centered(input.topic, 170, 123, 16, 185, boldFont);
  centered(`${input.score} / ${input.totalQuestions}`, 356, 123, 16, 130, boldFont);
  centered(formattedDate, 538, 123, 16, 190, boldFont);
  centered(input.certificateNumber, 732, 123, 12, 180, boldFont);
  return document.save();
}
