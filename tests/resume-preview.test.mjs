import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPreviewFrameDimensions,
  getPreviewFrameStyleVariables,
  RESUME_PAGE_HEIGHT_MM,
  RESUME_PAGE_WIDTH_MM,
  RESUME_PREVIEW_SCALES,
} from '../src/lib/resume/preview.ts'

test('keeps the printable resume page at A4 dimensions', () => {
  assert.equal(RESUME_PAGE_WIDTH_MM, 210)
  assert.equal(RESUME_PAGE_HEIGHT_MM, 297)
})

test('sizes the preview frame to the rendered scale instead of the full page layout', () => {
  assert.deepEqual(getPreviewFrameDimensions(RESUME_PREVIEW_SCALES.compact), {
    widthMm: 105,
    heightMm: 148.5,
  })
  assert.deepEqual(getPreviewFrameDimensions(RESUME_PREVIEW_SCALES.desktop), {
    widthMm: 121.8,
    heightMm: 172.26,
  })
  assert.deepEqual(getPreviewFrameDimensions(RESUME_PREVIEW_SCALES.wide), {
    widthMm: 136.5,
    heightMm: 193.05,
  })
})

test('provides the exact styles used by both rendered preview frames', () => {
  assert.deepEqual(getPreviewFrameStyleVariables(), {
    '--resume-preview-compact-width': '105mm',
    '--resume-preview-compact-height': '148.5mm',
    '--resume-preview-compact-scale': '0.5',
    '--resume-preview-desktop-width': '121.8mm',
    '--resume-preview-desktop-height': '172.26mm',
    '--resume-preview-desktop-scale': '0.58',
    '--resume-preview-wide-width': '136.5mm',
    '--resume-preview-wide-height': '193.05mm',
    '--resume-preview-wide-scale': '0.65',
  })
})
