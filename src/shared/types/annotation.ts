export interface PdfRect {
  x: number      // normalized 0–1 in PDF space
  y: number
  width: number
  height: number
}

export type AnnotationType = 'highlight' | 'underline'
export type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue'

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: 'rgba(255, 220, 0, 0.35)',
  green:  'rgba(72, 199, 116, 0.35)',
  pink:   'rgba(255, 100, 130, 0.35)',
  blue:   'rgba(108, 140, 255, 0.35)',
}

export interface Annotation {
  id?: number
  bookId: number
  pageNumber: number
  type: AnnotationType
  color: HighlightColor
  rects: PdfRect[]
  selectedText: string
  note?: string
  createdAt: Date
}
