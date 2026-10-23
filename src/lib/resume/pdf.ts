import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'
import type { ResumeData, ResumeSectionId } from '@/components/resume/types'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

function pdfSafeText(value: string): string {
  return value
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?')
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of pdfSafeText(text).split(/\r?\n/)) {
    if (!paragraph) {
      lines.push('')
      continue
    }
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate
        continue
      }
      if (line) lines.push(line)
      line = ''
      for (const character of word) {
        if (font.widthOfTextAtSize(`${line}${character}`, size) > maxWidth && line) {
          lines.push(line)
          line = character
        } else {
          line += character
        }
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

export async function buildResumePdf(data: ResumeData): Promise<Uint8Array> {
  const document = await PDFDocument.create()
  const classic = data.layout === 'classic'
  const regular = await document.embedFont(classic ? StandardFonts.TimesRoman : StandardFonts.Helvetica)
  const bold = await document.embedFont(classic ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold)
  const muted = rgb(0.32, 0.36, 0.4)
  const accent = rgb(0.04, 0.42, 0.31)
  const dark = rgb(0.1, 0.13, 0.16)
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN
  }

  const ensureSpace = (height: number) => {
    if (y - height < MARGIN) addPage()
  }

  const drawWrapped = (
    text: string,
    font: PDFFont,
    size: number,
    color = dark,
    lineHeight = size * 1.35,
    left = MARGIN,
    maxWidth = CONTENT_WIDTH,
  ) => {
    for (const line of wrapText(text, font, size, maxWidth)) {
      ensureSpace(lineHeight)
      if (line) page.drawText(line, { x: left, y: y - size, size, font, color })
      y -= lineHeight
    }
  }

  const drawSectionHeading = (title: string) => {
    ensureSpace(34)
    y -= 9
    page.drawText(pdfSafeText(title.toUpperCase()), {
      x: MARGIN,
      y: y - 11,
      size: 10,
      font: bold,
      color: accent,
    })
    y -= 16
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.7,
      color: accent,
    })
    y -= 7
  }

  const drawEntry = (title: string, subtitle: string, details: string[]) => {
    if (title.trim()) drawWrapped(title, bold, 10.5, dark, 13)
    if (subtitle.trim()) drawWrapped(subtitle, regular, 9, muted, 12)
    for (const detail of details) {
      if (detail.trim()) drawWrapped(detail, regular, 9, muted, 12, MARGIN + 8, CONTENT_WIDTH - 8)
    }
    y -= 6
  }

  if (data.layout === 'modern') {
    page.drawRectangle({ x: 0, y: y - 94, width: PAGE_WIDTH, height: 94, color: accent })
    y -= 12
  }

  if (data.personalInfo.fullName.trim()) {
    drawWrapped(data.personalInfo.fullName.trim(), bold, 24, data.layout === 'modern' ? rgb(1, 1, 1) : dark, 29)
  }
  if (data.personalInfo.jobTitle.trim()) {
    drawWrapped(data.personalInfo.jobTitle.trim(), regular, 12, data.layout === 'modern' ? rgb(0.9, 0.97, 0.94) : muted, 17)
  }
  const contact = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    ...data.links.filter(link => link.label.trim() && link.url.trim()).map(link => `${link.label.trim()}: ${link.url.trim()}`),
    ...(!data.links.some(link => link.label.trim().toLowerCase() === 'linkedin') && data.personalInfo.linkedin.trim() ? `LinkedIn: ${data.personalInfo.linkedin.trim()}` : []),
    ...(!data.links.some(link => link.label.trim().toLowerCase() === 'portfolio') && data.personalInfo.portfolio.trim() ? `Portfolio: ${data.personalInfo.portfolio.trim()}` : []),
  ].map(item => item.trim()).filter(Boolean)
  if (contact.length) {
    drawWrapped(contact.join('  |  '), regular, 8.5, data.layout === 'modern' ? rgb(0.9, 0.97, 0.94) : muted, 12)
  }
  y -= 7

  for (const section of data.sectionOrder as ResumeSectionId[]) {
    if (data.hiddenSections.includes(section)) continue
    if (section === 'personal' && data.summary.trim()) {
      drawSectionHeading('Professional Summary')
      drawWrapped(data.summary.trim(), regular, 9.5, dark, 13)
    }
    if (section === 'education') {
      const entries = data.education.filter(item => [item.degree, item.institution, item.location, item.startDate, item.endDate, item.score, item.gpa, item.courses].some(value => value.trim()))
      if (entries.length) {
        drawSectionHeading(data.sectionLabels.education)
        for (const item of entries) {
          drawEntry(
            item.degree,
            [item.institution, item.location].filter(Boolean).join(' | '),
            [
              [item.startDate, item.endDate].filter(Boolean).join(' - '),
              item.score || item.gpa ? `Score / GPA: ${item.score || item.gpa}` : '',
              item.courses ? `Relevant coursework: ${item.courses}` : '',
            ],
          )
        }
      }
    }
    if (section === 'experience') {
      const entries = data.experience.filter(item => [item.title, item.company, item.location, item.startDate, item.endDate, item.description].some(value => value.trim()))
      if (entries.length) {
        drawSectionHeading(data.sectionLabels.experience)
        for (const item of entries) {
          drawEntry(
            item.title,
            [item.company, item.location].filter(Boolean).join(' | '),
            [[item.startDate, item.endDate].filter(Boolean).join(' - '), item.description],
          )
        }
      }
    }
    if (section === 'projects') {
      const entries = data.projects.filter(item => [item.title, item.link, item.description].some(value => value.trim()))
      if (entries.length) {
        drawSectionHeading(data.sectionLabels.projects)
        for (const item of entries) drawEntry(item.title, item.link, [item.description])
      }
    }
    if (section === 'skills' && data.skills.trim()) {
      drawSectionHeading(data.sectionLabels.skills)
      drawWrapped(data.skills.trim(), regular, 9.5, dark, 13)
    }
    if (section === 'awards') {
      const entries = data.awards.filter(item => [item.title, item.issuer, item.date, item.description].some(value => value.trim()))
      if (entries.length) {
        drawSectionHeading(data.sectionLabels.awards)
        for (const item of entries) {
          drawEntry(item.title, [item.issuer, item.date].filter(Boolean).join(' | '), [item.description])
        }
      }
    }
  }

  for (const section of data.customSections) {
    if (!section.title.trim() || !section.content.trim()) continue
    drawSectionHeading(section.title)
    drawWrapped(section.content.trim(), regular, 9.5, dark, 13)
  }

  return document.save()
}
