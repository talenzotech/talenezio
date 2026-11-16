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
