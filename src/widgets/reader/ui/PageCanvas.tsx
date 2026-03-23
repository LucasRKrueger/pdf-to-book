import { useRef } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { usePageRenderer } from '@/features/read-pdf'

interface Props {
  doc: PDFDocumentProxy
  pageNumber: number
  scale: number
  onPageReady?: (page: PDFPageProxy) => void
}

export function PageCanvas({ doc, pageNumber, scale, onPageReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  usePageRenderer({ doc, pageNumber, scale, canvasRef, onPageReady })

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ maxWidth: '100%' }}
    />
  )
}
