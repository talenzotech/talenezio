import 'server-only';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function buildCertificatePdf(input: {
  candidateName: string;
  certificateNumber: string;
  topic: string;
  score: number;
  totalQuestions: number;
  issuedAt: string;
  performanceStatement: string;
}): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([842, 595]);
  const headingFont = await document.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await document.embedFont(StandardFonts.Helvetica);
  const italicFont = await document.embedFont(StandardFonts.HelveticaOblique);
  const navy = rgb(0.05, 0.16, 0.38);
  const blue = rgb(0.12, 0.38, 0.82);

  page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: 38, y: 38, width: 766, height: 519, borderColor: blue, borderWidth: 1 });
  page.drawText('TALENEZIO', { x: 60, y: 505, size: 28, font: headingFont, color: navy });
  page.drawText('CERTIFICATE', { x: 60, y: 455, size: 34, font: headingFont, color: blue });
  page.drawText('of achievement', { x: 62, y: 432, size: 16, font: italicFont, color: navy });
  page.drawText('This certificate is presented to', { x: 60, y: 365, size: 16, font: bodyFont, color: navy });
  page.drawText(input.candidateName || 'Talenezio learner', { x: 60, y: 325, size: 30, font: headingFont, color: navy });
  page.drawText(`for completing the ${input.topic} assessment`, { x: 60, y: 285, size: 16, font: bodyFont, color: navy });
  page.drawText(`Score: ${input.score}/${input.totalQuestions}`, { x: 60, y: 245, size: 15, font: headingFont, color: blue });
  page.drawText(input.performanceStatement, { x: 60, y: 210, size: 13, font: bodyFont, color: navy, maxWidth: 530 });
  page.drawText(`Issued: ${new Date(input.issuedAt).toLocaleDateString('en-IN')}`, { x: 60, y: 100, size: 12, font: bodyFont, color: navy });
  page.drawText(`Certificate No: ${input.certificateNumber}`, { x: 60, y: 78, size: 10, font: bodyFont, color: navy });
  page.drawLine({ start: { x: 635, y: 112 }, end: { x: 765, y: 112 }, thickness: 1, color: navy });
  page.drawText('Authorized Signatory', { x: 650, y: 92, size: 11, font: italicFont, color: navy });

  return document.save();
}
