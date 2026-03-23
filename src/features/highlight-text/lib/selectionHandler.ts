import type { PDFPageProxy } from 'pdfjs-dist'
import type { PdfRect } from '@/shared/types/annotation'

export interface SelectionResult {
  text: string
  rects: PdfRect[]
}

/**
 * Capture current window selection and normalize it to PDF-space coordinates.
 * The textLayerEl must be the element that contains the PDF.js text spans.
 * The page viewport scale is the CSS pixel scale (not multiplied by DPR).
 */
export function captureSelection(
  textLayerEl: HTMLElement,
  page: PDFPageProxy,
  cssScale: number,
): SelectionResult | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null

  const text = selection.toString().trim()
  if (!text) return null

  const layerRect = textLayerEl.getBoundingClientRect()
  const viewport = page.getViewport({ scale: 1 })
  const layerWidth = viewport.width * cssScale
  const layerHeight = viewport.height * cssScale

  const rects: PdfRect[] = []

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i)
    const domRects = Array.from(range.getClientRects())

    for (const r of domRects) {
      if (r.width < 1 || r.height < 1) continue
      rects.push({
        x: (r.left - layerRect.left) / layerWidth,
        y: (r.top - layerRect.top) / layerHeight,
        width: r.width / layerWidth,
        height: r.height / layerHeight,
      })
    }
  }

  if (rects.length === 0) return null
  return { text, rects }
}
