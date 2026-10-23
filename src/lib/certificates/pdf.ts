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
  // Landscape A4: 842 x 595
  const page = document.addPage([842, 595]);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await document.embedFont(StandardFonts.Helvetica);
  const obliqueFont = await document.embedFont(StandardFonts.HelveticaOblique);

  const navy = rgb(0.06, 0.12, 0.28);
  const gold = rgb(0.76, 0.58, 0.18);
  const lightGold = rgb(0.97, 0.94, 0.86);
  const slate = rgb(0.35, 0.42, 0.52);
  const blue = rgb(0.12, 0.38, 0.82);

  // Outer Decorative Borders
  page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: 28, y: 28, width: 786, height: 539, borderColor: gold, borderWidth: 1.5 });
  page.drawRectangle({ x: 33, y: 33, width: 776, height: 529, borderColor: navy, borderWidth: 0.5 });

  // Corner Ornaments
  const corners = [
    { x: 33, y: 33 },
    { x: 809 - 14, y: 33 },
    { x: 33, y: 562 - 14 },
    { x: 809 - 14, y: 562 - 14 },
  ];
  for (const c of corners) {
    page.drawRectangle({ x: c.x, y: c.y, width: 14, height: 14, color: gold });
  }

  // Header Institution
  const org = 'TALENEZIO ACCREDITED SKILL CERTIFICATION';
  const orgWidth = boldFont.widthOfTextAtSize(org, 12);
  page.drawText(org, { x: (842 - orgWidth) / 2, y: 512, size: 12, font: boldFont, color: gold });

  // Certificate Title
  const title = 'CERTIFICATE OF ACHIEVEMENT';
  const titleWidth = boldFont.widthOfTextAtSize(title, 28);
  page.drawText(title, { x: (842 - titleWidth) / 2, y: 466, size: 28, font: boldFont, color: navy });

  const sub = 'THIS IS PROUDLY PRESENTED TO';
  const subWidth = obliqueFont.widthOfTextAtSize(sub, 12);
  page.drawText(sub, { x: (842 - subWidth) / 2, y: 430, size: 12, font: obliqueFont, color: slate });

  // Candidate Name
  const name = (input.candidateName || 'Talenezio Learner').trim();
  const nameSize = name.length > 25 ? 24 : 30;
  const nameWidth = boldFont.widthOfTextAtSize(name, nameSize);
  page.drawText(name, { x: (842 - nameWidth) / 2, y: 382, size: nameSize, font: boldFont, color: navy });

  // Underline beneath name
  page.drawLine({
    start: { x: Math.max(60, (842 - nameWidth) / 2 - 25), y: 374 },
    end: { x: Math.min(782, (842 + nameWidth) / 2 + 25), y: 374 },
    thickness: 1.5,
    color: gold,
  });

  // Statement
  const forCompleting = 'for successfully demonstrating proficiency and completing the Industry-Standard Assessment in';
  const forWidth = regularFont.widthOfTextAtSize(forCompleting, 12);
  page.drawText(forCompleting, { x: (842 - forWidth) / 2, y: 338, size: 12, font: regularFont, color: slate });

  // Topic Name
  const topic = input.topic || 'Skill Assessment';
  const topicWidth = boldFont.widthOfTextAtSize(topic, 20);
  page.drawText(topic, { x: (842 - topicWidth) / 2, y: 304, size: 20, font: boldFont, color: blue });

  // Performance Statement
  const perf = input.performanceStatement || 'Demonstrated outstanding subject matter expertise and proficiency.';
  const perfWidth = obliqueFont.widthOfTextAtSize(perf, 11);
  if (perfWidth < 700) {
    page.drawText(perf, { x: (842 - perfWidth) / 2, y: 272, size: 11, font: obliqueFont, color: slate });
  } else {
    page.drawText(perf, { x: 70, y: 272, size: 10, font: obliqueFont, color: slate, maxWidth: 700 });
  }

  // Score Banner
  const pct = Math.round((input.score / (input.totalQuestions || 20)) * 100);
  const rating = pct >= 90 ? 'Outstanding' : pct >= 75 ? 'Distinction' : 'Passed';
  const scoreText = `Score: ${input.score} / ${input.totalQuestions} (${pct}%)   •   Proficiency Rating: ${rating}`;
  const scoreWidth = boldFont.widthOfTextAtSize(scoreText, 11);
  const bannerWidth = scoreWidth + 40;
  page.drawRectangle({
    x: (842 - bannerWidth) / 2,
    y: 220,
    width: bannerWidth,
    height: 26,
    color: lightGold,
    borderColor: gold,
    borderWidth: 1,
  });
  page.drawText(scoreText, { x: (842 - scoreWidth) / 2, y: 228, size: 11, font: boldFont, color: navy });

  // Verification & Metadata Details (Left Footer)
  page.drawText(`Certificate ID: ${input.certificateNumber}`, { x: 60, y: 125, size: 9.5, font: boldFont, color: navy });
  page.drawText(`Issued: ${new Date(input.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { x: 60, y: 108, size: 9, font: regularFont, color: slate });
  page.drawText('Accreditation: Talenezio Skill Verification Board', { x: 60, y: 92, size: 8.5, font: regularFont, color: slate });
  page.drawText('Verify Credential: talenezio.com/verify', { x: 60, y: 76, size: 8.5, font: regularFont, color: blue });

  // Seal (Center-Right)
  page.drawCircle({ x: 421, y: 105, size: 28, borderColor: gold, borderWidth: 1.5, color: lightGold });
  page.drawCircle({ x: 421, y: 105, size: 25, borderColor: navy, borderWidth: 0.5 });
  const seal1 = 'VERIFIED';
  const seal1Width = boldFont.widthOfTextAtSize(seal1, 7);
  page.drawText(seal1, { x: 421 - seal1Width / 2, y: 109, size: 7, font: boldFont, color: navy });
  const seal2 = 'ACCREDITED';
  const seal2Width = boldFont.widthOfTextAtSize(seal2, 6);
  page.drawText(seal2, { x: 421 - seal2Width / 2, y: 99, size: 6, font: boldFont, color: gold });

  // Authorized Signatures (Right Footer)
  page.drawLine({ start: { x: 570, y: 115 }, end: { x: 760, y: 115 }, thickness: 1, color: slate });
  page.drawText('Authorized Evaluation Signatory', { x: 585, y: 98, size: 10, font: boldFont, color: navy });
  page.drawText('Talenezio Skill Assessment Council', { x: 578, y: 84, size: 8.5, font: obliqueFont, color: slate });

  return document.save();
}
