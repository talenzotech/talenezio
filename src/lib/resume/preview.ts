export const RESUME_PAGE_WIDTH_MM = 210
export const RESUME_PAGE_HEIGHT_MM = 297

export const RESUME_PREVIEW_SCALES = {
  compact: 0.5,
  desktop: 0.58,
  wide: 0.65,
} as const

export function getPreviewFrameDimensions(scale: number) {
  return {
    widthMm: RESUME_PAGE_WIDTH_MM * scale,
    heightMm: RESUME_PAGE_HEIGHT_MM * scale,
  }
}

export function getPreviewFrameStyleVariables() {
  const compact = getPreviewFrameDimensions(RESUME_PREVIEW_SCALES.compact)
  const desktop = getPreviewFrameDimensions(RESUME_PREVIEW_SCALES.desktop)
  const wide = getPreviewFrameDimensions(RESUME_PREVIEW_SCALES.wide)

  return {
    '--resume-preview-compact-width': `${compact.widthMm}mm`,
    '--resume-preview-compact-height': `${compact.heightMm}mm`,
    '--resume-preview-compact-scale': String(RESUME_PREVIEW_SCALES.compact),
    '--resume-preview-desktop-width': `${desktop.widthMm}mm`,
    '--resume-preview-desktop-height': `${desktop.heightMm}mm`,
    '--resume-preview-desktop-scale': String(RESUME_PREVIEW_SCALES.desktop),
    '--resume-preview-wide-width': `${wide.widthMm}mm`,
    '--resume-preview-wide-height': `${wide.heightMm}mm`,
    '--resume-preview-wide-scale': String(RESUME_PREVIEW_SCALES.wide),
  }
}
